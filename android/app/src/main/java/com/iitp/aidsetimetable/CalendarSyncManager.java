package com.iitp.aidsetimetable;

import android.Manifest;
import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.ContentValues;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.provider.CalendarContract;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashSet;
import java.util.Iterator;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.TimeZone;

class CalendarSyncManager {
    static final int RESULT_PERMISSION_REQUIRED = -2;
    static final int RESULT_NO_GOOGLE_CALENDAR = -3;
    static final int RESULT_FAILED = -4;

    private static final String PREFS_NAME = "google_calendar_sync";
    private static final String ENABLED_KEY = "enabled";
    private static final String PAYLOAD_KEY = "payload";
    private static final String MANAGED_EVENTS_KEY = "managedEvents";
    private static final String CALENDAR_ID_KEY = "calendarId";
    private static final String PAYLOAD_HASH_KEY = "payloadHash";
    private static final String CUSTOM_URI_PREFIX = "iitp-timetable://event/";
    private static final String MARKER_PREFIX = "[IITP-AI-DSE:";
    private static final String MARKER_SUFFIX = "]";

    private final Context context;
    private final ContentResolver resolver;
    private final SharedPreferences prefs;

    CalendarSyncManager(Context context) {
        this.context = context.getApplicationContext();
        resolver = this.context.getContentResolver();
        prefs = this.context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    boolean hasPermissions() {
        return context.checkSelfPermission(Manifest.permission.READ_CALENDAR)
                == PackageManager.PERMISSION_GRANTED
                && context.checkSelfPermission(Manifest.permission.WRITE_CALENDAR)
                == PackageManager.PERMISSION_GRANTED;
    }

    boolean hasManagedEvents() {
        try {
            return new JSONObject(prefs.getString(MANAGED_EVENTS_KEY, "{}")).length() > 0;
        } catch (JSONException ignored) {
            return false;
        }
    }

    void saveRequest(String payload, boolean enabled) {
        prefs.edit()
                .putString(PAYLOAD_KEY, payload == null ? "" : payload)
                .putBoolean(ENABLED_KEY, enabled)
                .commit();
    }

    synchronized int syncSaved() {
        return sync(
                prefs.getString(PAYLOAD_KEY, ""),
                prefs.getBoolean(ENABLED_KEY, false)
        );
    }

    synchronized int sync(String payload, boolean enabled) {
        saveRequest(payload, enabled);
        if (!hasPermissions()) {
            return !enabled && !hasManagedEvents() ? 0 : RESULT_PERMISSION_REQUIRED;
        }

        JSONObject savedManagedEvents = readManagedEvents();
        if (!enabled) {
            removeAllDiscoverableEvents();
            removeManagedEvents(savedManagedEvents);
            clearManagedState();
            return 0;
        }

        long calendarId = findPrimaryGoogleCalendar();
        if (calendarId < 0) return RESULT_NO_GOOGLE_CALENDAR;

        try {
            JSONObject root = new JSONObject(payload);
            JSONArray events = root.optJSONArray("events");
            if (events == null) return RESULT_FAILED;

            long previousCalendarId = prefs.getLong(CALENDAR_ID_KEY, -1L);
            if (previousCalendarId != -1L && previousCalendarId != calendarId) {
                removeManagedEvents(savedManagedEvents);
                savedManagedEvents = new JSONObject();
            }
            removeDiscoverableEventsOutsideCalendar(calendarId);

            JSONObject managedEvents = discoverManagedEvents(calendarId);
            if (previousCalendarId == calendarId) {
                mergeManagedEvents(managedEvents, savedManagedEvents);
            }

            String payloadHash = Integer.toHexString(payload.hashCode());
            if (calendarId == previousCalendarId
                    && payloadHash.equals(prefs.getString(PAYLOAD_HASH_KEY, ""))
                    && managedEvents.length() == events.length()) {
                return managedEvents.length();
            }

            JSONObject nextManagedEvents = new JSONObject();
            Set<String> desiredIds = new HashSet<>();

            for (int i = 0; i < events.length(); i += 1) {
                JSONObject event = events.optJSONObject(i);
                if (event == null) continue;

                String appEventId = event.optString("id", "");
                long startsAt = event.optLong("startsAt", 0L);
                if (appEventId.isEmpty() || startsAt <= 0L) continue;

                desiredIds.add(appEventId);
                long providerEventId = managedEvents.optLong(appEventId, -1L);
                long syncedEventId = upsertEvent(calendarId, providerEventId, event);
                if (syncedEventId > 0L) {
                    nextManagedEvents.put(appEventId, syncedEventId);
                } else if (providerEventId > 0L) {
                    nextManagedEvents.put(appEventId, providerEventId);
                }
            }

            Iterator<String> oldIds = managedEvents.keys();
            while (oldIds.hasNext()) {
                String oldAppEventId = oldIds.next();
                if (!desiredIds.contains(oldAppEventId)) {
                    deleteProviderEvent(managedEvents.optLong(oldAppEventId, -1L));
                }
            }

            prefs.edit()
                    .putString(MANAGED_EVENTS_KEY, nextManagedEvents.toString())
                    .putLong(CALENDAR_ID_KEY, calendarId)
                    .putString(PAYLOAD_HASH_KEY, payloadHash)
                    .commit();
            return nextManagedEvents.length();
        } catch (JSONException | RuntimeException ignored) {
            return RESULT_FAILED;
        }
    }

    private long findPrimaryGoogleCalendar() {
        String[] projection = {
                CalendarContract.Calendars._ID,
                CalendarContract.Calendars.IS_PRIMARY
        };
        String selection = CalendarContract.Calendars.ACCOUNT_TYPE + " = ? AND "
                + CalendarContract.Calendars.CALENDAR_ACCESS_LEVEL + " >= ? AND "
                + CalendarContract.Calendars.VISIBLE + " = 1 AND "
                + CalendarContract.Calendars.SYNC_EVENTS + " = 1";
        String[] selectionArgs = {
                "com.google",
                String.valueOf(CalendarContract.Calendars.CAL_ACCESS_CONTRIBUTOR)
        };

        try (Cursor cursor = resolver.query(
                CalendarContract.Calendars.CONTENT_URI,
                projection,
                selection,
                selectionArgs,
                CalendarContract.Calendars.IS_PRIMARY + " DESC, "
                        + CalendarContract.Calendars._ID + " ASC"
        )) {
            if (cursor != null && cursor.moveToFirst()) {
                return cursor.getLong(0);
            }
        } catch (RuntimeException ignored) {
            return -1L;
        }
        return -1L;
    }

    private long upsertEvent(long calendarId, long providerEventId, JSONObject event) {
        ContentValues values = eventValues(calendarId, event);
        try {
            if (providerEventId > 0L) {
                Uri eventUri = ContentUris.withAppendedId(
                        CalendarContract.Events.CONTENT_URI,
                        providerEventId
                );
                if (resolver.update(eventUri, values, null, null) > 0) {
                    return providerEventId;
                }
            }

            Uri inserted = resolver.insert(CalendarContract.Events.CONTENT_URI, values);
            return inserted == null ? -1L : ContentUris.parseId(inserted);
        } catch (RuntimeException ignored) {
            return -1L;
        }
    }

    private ContentValues eventValues(long calendarId, JSONObject event) {
        long startsAt = event.optLong("startsAt", 0L);
        long endsAt = event.optLong("endsAt", startsAt + 90L * 60L * 1000L);
        String moodleUrl = event.optString("moodleUrl", "");
        String details = event.optString("courseCode", "");
        if (!moodleUrl.isEmpty()) {
            details = details.isEmpty() ? moodleUrl : details + "\nMoodle: " + moodleUrl;
        }
        String appEventId = event.optString("id", "");
        String marker = MARKER_PREFIX + appEventId + MARKER_SUFFIX;
        details = details.isEmpty() ? marker : details + "\n\n" + marker;

        ContentValues values = new ContentValues();
        values.put(CalendarContract.Events.CALENDAR_ID, calendarId);
        values.put(CalendarContract.Events.TITLE, event.optString("title", "IITP class"));
        values.put(CalendarContract.Events.DESCRIPTION, details);
        values.put(CalendarContract.Events.EVENT_LOCATION, "IIT Patna online class");
        values.put(CalendarContract.Events.DTSTART, startsAt);
        values.put(CalendarContract.Events.DTEND, Math.max(endsAt, startsAt + 60_000L));
        values.put(CalendarContract.Events.EVENT_TIMEZONE, TimeZone.getDefault().getID());
        values.put(CalendarContract.Events.AVAILABILITY, CalendarContract.Events.AVAILABILITY_BUSY);
        values.put(CalendarContract.Events.STATUS, CalendarContract.Events.STATUS_CONFIRMED);
        values.put(CalendarContract.Events.CUSTOM_APP_PACKAGE, context.getPackageName());
        values.put(CalendarContract.Events.CUSTOM_APP_URI, CUSTOM_URI_PREFIX + appEventId);
        return values;
    }

    private JSONObject discoverManagedEvents(long calendarId) {
        JSONObject result = new JSONObject();
        List<Long> duplicateIds = new ArrayList<>();
        String[] projection = {
                CalendarContract.Events._ID,
                CalendarContract.Events.CUSTOM_APP_URI,
                CalendarContract.Events.DESCRIPTION
        };
        String selection = CalendarContract.Events.CALENDAR_ID + " = ? AND "
                + ownedEventSelection();
        String[] selectionArgs = {
                String.valueOf(calendarId),
                context.getPackageName(),
                CUSTOM_URI_PREFIX + "%",
                "%" + MARKER_PREFIX + "%"
        };

        try (Cursor cursor = resolver.query(
                CalendarContract.Events.CONTENT_URI,
                projection,
                selection,
                selectionArgs,
                CalendarContract.Events._ID + " ASC"
        )) {
            if (cursor != null) {
                while (cursor.moveToNext()) {
                    long providerEventId = cursor.getLong(0);
                    String appEventId = extractAppEventId(cursor.getString(1), cursor.getString(2));
                    if (appEventId.isEmpty()) continue;

                    if (result.has(appEventId)) {
                        duplicateIds.add(providerEventId);
                    } else {
                        result.put(appEventId, providerEventId);
                    }
                }
            }
        } catch (JSONException | RuntimeException ignored) {
            return result;
        }

        for (long duplicateId : duplicateIds) {
            deleteProviderEvent(duplicateId);
        }
        return result;
    }

    private void removeDiscoverableEventsOutsideCalendar(long calendarId) {
        String selection = CalendarContract.Events.CALENDAR_ID + " != ? AND "
                + ownedEventSelection();
        String[] selectionArgs = {
                String.valueOf(calendarId),
                context.getPackageName(),
                CUSTOM_URI_PREFIX + "%",
                "%" + MARKER_PREFIX + "%"
        };
        removeEventsMatching(selection, selectionArgs);
    }

    private void removeAllDiscoverableEvents() {
        String[] selectionArgs = {
                context.getPackageName(),
                CUSTOM_URI_PREFIX + "%",
                "%" + MARKER_PREFIX + "%"
        };
        removeEventsMatching(ownedEventSelection(), selectionArgs);
    }

    private String ownedEventSelection() {
        return "((" + CalendarContract.Events.CUSTOM_APP_PACKAGE + " = ? AND "
                + CalendarContract.Events.CUSTOM_APP_URI + " LIKE ?) OR "
                + CalendarContract.Events.DESCRIPTION + " LIKE ?)";
    }

    private void removeEventsMatching(String selection, String[] selectionArgs) {
        List<Long> eventIds = new ArrayList<>();
        try (Cursor cursor = resolver.query(
                CalendarContract.Events.CONTENT_URI,
                new String[]{CalendarContract.Events._ID},
                selection,
                selectionArgs,
                null
        )) {
            if (cursor != null) {
                while (cursor.moveToNext()) {
                    eventIds.add(cursor.getLong(0));
                }
            }
        } catch (RuntimeException ignored) {
            return;
        }

        for (long eventId : eventIds) {
            deleteProviderEvent(eventId);
        }
    }

    private String extractAppEventId(String customUri, String description) {
        if (customUri != null && customUri.startsWith(CUSTOM_URI_PREFIX)) {
            return customUri.substring(CUSTOM_URI_PREFIX.length());
        }
        if (description == null) return "";

        int markerStart = description.lastIndexOf(MARKER_PREFIX);
        if (markerStart < 0) return "";
        int idStart = markerStart + MARKER_PREFIX.length();
        int markerEnd = description.indexOf(MARKER_SUFFIX, idStart);
        return markerEnd > idStart ? description.substring(idStart, markerEnd) : "";
    }

    private void mergeManagedEvents(JSONObject target, JSONObject source) {
        Iterator<String> keys = source.keys();
        while (keys.hasNext()) {
            String key = keys.next();
            if (target.has(key)) continue;
            try {
                target.put(key, source.optLong(key, -1L));
            } catch (JSONException ignored) {
                // Continue merging any remaining valid provider IDs.
            }
        }
    }

    private JSONObject readManagedEvents() {
        try {
            return new JSONObject(prefs.getString(MANAGED_EVENTS_KEY, "{}"));
        } catch (JSONException ignored) {
            return new JSONObject();
        }
    }

    private void removeManagedEvents(JSONObject managedEvents) {
        Iterator<String> keys = managedEvents.keys();
        while (keys.hasNext()) {
            deleteProviderEvent(managedEvents.optLong(keys.next(), -1L));
        }
    }

    private void deleteProviderEvent(long providerEventId) {
        if (providerEventId <= 0L) return;

        try {
            resolver.delete(
                    ContentUris.withAppendedId(
                            CalendarContract.Events.CONTENT_URI,
                            providerEventId
                    ),
                    null,
                    null
            );
        } catch (RuntimeException ignored) {
            // The event may already have been deleted from Google Calendar.
        }
    }

    private void clearManagedState() {
        prefs.edit()
                .remove(MANAGED_EVENTS_KEY)
                .remove(CALENDAR_ID_KEY)
                .remove(PAYLOAD_HASH_KEY)
                .commit();
    }
}
