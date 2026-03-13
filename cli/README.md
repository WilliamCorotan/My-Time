# DTR CLI - Daily Time Record Command Line Interface

Track your time directly from the command line with the DTR CLI tool.

## Installation

### Option 1: Install from directory (local development)

```bash
cd cli
npm install
npm run build
npm link
```

### Option 2: Install globally (after publishing to npm)

```bash
npm install -g dtr-cli
```

## Setup

Before using the CLI, you need to configure it with your API endpoint and authentication token.

### Step 1: Generate an API Token

1. Go to your DTR web application
2. Navigate to Settings or API Tokens section
3. Click "Generate New Token"
4. Give it a name (e.g., "My Laptop CLI")
5. Copy the token (you won't be able to see it again!)

### Step 2: Configure the CLI

```bash
dtr config --endpoint https://your-dtr-app.com --token dtr_your_api_token_here
```

Replace:
- `https://your-dtr-app.com` with your actual DTR application URL
- `dtr_your_api_token_here` with the token you generated

## Usage

### Clock In

Start tracking your time:

```bash
dtr in
# or
dtr clock-in
```

### Clock Out

Stop tracking your time (note is required):

```bash
dtr out --note "Completed feature X"
# or
dtr out -n "Fixed bug in authentication"
```

### Check Status

View your current clock status and today's time entries:

```bash
dtr status
```

This will show:
- Whether you're currently clocked in or out
- If clocked in, how long you've been working
- All time entries for today with durations and notes
- Total time worked today

## Examples

```bash
# Start your work day
dtr in

# Check how long you've been working
dtr status

# Take a break
dtr out -n "Lunch break"

# Return from break
dtr in

# End your day
dtr out -n "Completed daily tasks, prepared for tomorrow"
```

## Configuration File

The CLI stores its configuration in `~/.dtr/config.json`. This file contains:
- Your API endpoint
- Your authentication token

Keep this file secure and don't share it with others.

## Troubleshooting

### "Not configured" error

Run `dtr config` with your endpoint and token.

### "Invalid or expired token" error

Your token may have expired or been revoked. Generate a new token from the web application and run `dtr config` again.

### "Missing or invalid authorization header" error

Make sure you've configured the CLI properly with `dtr config`.

## Security Notes

- API tokens are stored locally in `~/.dtr/config.json`
- Keep your tokens secure and don't share them
- Revoke tokens you're no longer using from the web application
- Each device/location should have its own token for better security tracking

## Support

For issues or questions, please contact your system administrator or visit the project repository.
