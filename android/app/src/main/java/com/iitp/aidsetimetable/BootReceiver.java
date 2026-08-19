package com.iitp.aidsetimetable;

import android.app.AlarmManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (Intent.ACTION_BOOT_COMPLETED.equals(action)
                || Intent.ACTION_MY_PACKAGE_REPLACED.equals(action)
                || Intent.ACTION_TIME_CHANGED.equals(action)
                || Intent.ACTION_TIMEZONE_CHANGED.equals(action)
                || AlarmManager.ACTION_SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED.equals(action)) {
            PendingResult pendingResult = goAsync();
            Context appContext = context.getApplicationContext();
            new Thread(() -> {
                try {
                    new ReminderScheduler(appContext).rescheduleSaved();
                } finally {
                    pendingResult.finish();
                }
            }, "reminder-reschedule").start();
        }
    }
}
