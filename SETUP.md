# Aurora OS - Setup Guide

## Prerequisites Installation

### 1. Install Rust (Required for Tauri)
Open your Terminal and run:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```
- Follow the prompts (press Enter to accept defaults)
- After installation, restart your terminal or run: `source $HOME/.cargo/env`
- Verify: `rustc --version`

### 2. Install Xcode Command Line Tools (Required for macOS development)
```bash
xcode-select --install
```
- Follow the installation prompts

### 3. Verify Node.js (you mentioned you have this)
```bash
node --version  # Should show v18 or higher
npm --version   # Should show npm version
```

If not installed, get it from: https://nodejs.org/

### 4. Install Tauri CLI
```bash
cargo install tauri-cli@^2.0.0
```

## Project Setup

Once you have the prerequisites installed, run these commands in the `aurora` directory:

### 1. Install Node dependencies
```bash
npm install
```

### 2. Run development server
```bash
npm run tauri dev
```

This will:
- Build the Rust backend
- Start the Next.js frontend
- Launch the Aurora OS app

### 3. Build for production
```bash
npm run tauri build
```

## Troubleshooting

### If you get permission errors:
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### If Rust isn't in your PATH:
Add this to your `~/.zshrc` or `~/.bash_profile`:
```bash
export PATH="$HOME/.cargo/bin:$PATH"
```

Then run: `source ~/.zshrc`

## Next Steps

After running `npm run tauri dev`, you should see the Aurora OS window open!

I'll guide you through each feature as we build it.
