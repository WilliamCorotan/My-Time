#!/usr/bin/env node

import { program } from 'commander';
import { clockIn, clockOut, status, configure } from './commands';

program
  .name('dtr')
  .description('Daily Time Record CLI - Track your time from the command line')
  .version('1.0.0');

program
  .command('config')
  .description('Configure the CLI with your API endpoint and token')
  .option('-e, --endpoint <url>', 'API endpoint URL')
  .option('-t, --token <token>', 'API authentication token')
  .action(configure);

program
  .command('in')
  .alias('clock-in')
  .description('Clock in to start tracking time')
  .action(clockIn);

program
  .command('out')
  .alias('clock-out')
  .description('Clock out and stop tracking time')
  .option('-n, --note <note>', 'Note for this time entry (required)')
  .action(clockOut);

program
  .command('status')
  .description('Check your current clock status')
  .action(status);

program.parse(process.argv);
