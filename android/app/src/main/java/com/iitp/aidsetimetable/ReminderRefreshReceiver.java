package com.iitp.aidsetimetable;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class ReminderRefreshReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (!ReminderScheduler.ACTION_REFRESH_REMINDERS.equals(intent.getAction())) return;

        PendingResult pendingResult = goAsync();
        Context appContext = context.getApplicationContext();
        new Thread(() -> {
            try {
                new ReminderScheduler(appContext).rescheduleSaved();
            } finally {
                pendingResult.finish();
            }
        }, "reminder-refresh").start();
    }
}
