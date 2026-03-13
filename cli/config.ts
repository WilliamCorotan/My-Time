import fs from 'fs';
import path from 'path';
import os from 'os';

export interface Config {
  endpoint: string;
  token: string;
}

const CONFIG_DIR = path.join(os.homedir(), '.dtr');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export function getConfig(): Config | null {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return null;
    }
    const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading config:', error);
    return null;
  }
}

export function saveConfig(config: Config): void {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error saving config:', error);
    throw error;
  }
}

export function validateConfig(config: Config | null): config is Config {
  if (!config) {
    console.error('❌ Not configured. Run "dtr config" first.');
    return false;
  }
  if (!config.endpoint || !config.token) {
    console.error('❌ Invalid configuration. Please run "dtr config" again.');
    return false;
  }
  return true;
}
