import { getConfig, saveConfig, validateConfig } from './config';
import { clockInApi, clockOutApi, getStatusApi } from './api';
import { formatDuration } from './utils';

interface ConfigOptions {
  endpoint?: string;
  token?: string;
}

interface ClockOutOptions {
  note?: string;
}

export async function configure(options: ConfigOptions) {
  try {
    const currentConfig = getConfig();

    const endpoint = options.endpoint || currentConfig?.endpoint;
    const token = options.token || currentConfig?.token;

    if (!endpoint || !token) {
      console.error('❌ Both endpoint and token are required.');
      console.log('\nUsage:');
      console.log('  dtr config --endpoint <url> --token <token>');
      console.log('\nExample:');
      console.log('  dtr config --endpoint https://your-app.com --token your-api-token');
      process.exit(1);
    }

    saveConfig({ endpoint, token });
    console.log('✅ Configuration saved successfully!');
    console.log(`   Endpoint: ${endpoint}`);
  } catch (error) {
    console.error('❌ Failed to save configuration:', error);
    process.exit(1);
  }
}

export async function clockIn() {
  const config = getConfig();
  if (!validateConfig(config)) {
    process.exit(1);
  }

  try {
    const response: any = await clockInApi(config);
    console.log('✅ Successfully clocked in!');
    if (response.message) {
      console.log(`   ${response.message}`);
    }
  } catch (error) {
    console.error('❌ Failed to clock in:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

export async function clockOut(options: ClockOutOptions) {
  const config = getConfig();
  if (!validateConfig(config)) {
    process.exit(1);
  }

  const note = options.note;
  if (!note || note.trim() === '') {
    console.error('❌ Note is required when clocking out.');
    console.log('\nUsage:');
    console.log('  dtr out --note "Your note here"');
    console.log('  dtr out -n "Your note here"');
    process.exit(1);
  }

  try {
    const response: any = await clockOutApi(config, note);
    console.log('✅ Successfully clocked out!');
    if (response.message) {
      console.log(`   ${response.message}`);
    }
  } catch (error) {
    console.error('❌ Failed to clock out:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

export async function status() {
  const config = getConfig();
  if (!validateConfig(config)) {
    process.exit(1);
  }

  try {
    const response: any = await getStatusApi(config);

    console.log('\n📊 Current Status\n');

    if (response.isClockedIn) {
      console.log('⏰ Status: CLOCKED IN');
      if (response.activeEntry) {
        const timeIn = new Date(response.activeEntry.timeIn);
        const now = new Date();
        const duration = Math.floor((now.getTime() - timeIn.getTime()) / 1000 / 60);

        console.log(`   Clocked in at: ${timeIn.toLocaleTimeString()}`);
        console.log(`   Duration: ${formatDuration(duration)}`);
      }
    } else {
      console.log('⏸️  Status: CLOCKED OUT');
    }

    if (response.todayEntries && response.todayEntries.length > 0) {
      console.log(`\n📅 Today's Entries: ${response.todayEntries.length}`);

      let totalMinutes = 0;
      response.todayEntries.forEach((entry: any, index: number) => {
        const timeIn = new Date(entry.timeIn);
        const timeOut = entry.timeOut ? new Date(entry.timeOut) : null;

        console.log(`\n   ${index + 1}. ${timeIn.toLocaleTimeString()} - ${timeOut ? timeOut.toLocaleTimeString() : 'Active'}`);

        if (entry.duration) {
          console.log(`      Duration: ${formatDuration(entry.duration)}`);
          totalMinutes += entry.duration;
        }

        if (entry.note) {
          console.log(`      Note: ${entry.note}`);
        }
      });

      if (totalMinutes > 0) {
        console.log(`\n⏱️  Total time today: ${formatDuration(totalMinutes)}`);
      }
    } else {
      console.log('\n📅 No entries for today yet.');
    }

    console.log('');
  } catch (error) {
    console.error('❌ Failed to get status:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
