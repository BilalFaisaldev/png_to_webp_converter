const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHECK_INTERVAL = 10000; // Check status every 10 seconds
const SETTLE_DELAY = 5000;    // Wait 5 seconds after last change detected before committing
const LOG_FILE = path.join(__dirname, '.git-sync.log');
const GIT_DIR = path.join(__dirname, '.git');

function log(message) {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] ${message}\n`;
    console.log(logMsg.trim());
    try {
        fs.appendFileSync(LOG_FILE, logMsg);
    } catch (err) {
        console.error('Failed to write to log file:', err);
    }
}

// Helper to execute commands in shell
function runCmd(command) {
    return new Promise((resolve, reject) => {
        exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
            if (error) {
                reject({ error, stdout, stderr });
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}

let settleTimer = null;
let isSyncing = false;

async function checkSync() {
    if (isSyncing) return;
    
    if (!fs.existsSync(GIT_DIR)) {
        log('Error: .git directory not found in this folder.');
        return;
    }

    try {
        const { stdout } = await runCmd('git status --porcelain');
        const changes = stdout.trim();

        if (changes) {
            // Ignore log file and watcher script updates themselves (should be handled by .gitignore but double check)
            const lines = changes.split('\n').filter(line => {
                const file = line.substring(3).trim();
                return file !== '.git-sync.log' && file !== 'git-sync-watcher.js';
            });

            if (lines.length > 0) {
                log(`Local changes detected:\n${lines.join('\n')}`);
                if (settleTimer) {
                    clearTimeout(settleTimer);
                }
                settleTimer = setTimeout(performSync, SETTLE_DELAY);
            }
        }
    } catch (err) {
        log(`Error running git status: ${err.stderr || (err.error && err.error.message) || err}`);
    }
}

async function performSync() {
    isSyncing = true;
    settleTimer = null;
    log('Auto-sync: Initiating commit & sync cycle...');

    try {
        // 1. Get current branch name
        const { stdout: branchOut } = await runCmd('git branch --show-current');
        const branch = branchOut.trim() || 'master';

        // 2. Check if a remote named 'origin' exists
        let hasRemote = false;
        try {
            const { stdout: remoteOut } = await runCmd('git remote');
            hasRemote = remoteOut.includes('origin');
        } catch (e) {
            log('Error checking git remote.');
        }

        // 3. Stage changes
        await runCmd('git add -A');
        
        // 4. Commit changes
        const commitMsg = `Auto-sync: local updates (${new Date().toLocaleString()})`;
        try {
            await runCmd(`git commit -m "${commitMsg}"`);
            log('Local commit created successfully.');
        } catch (commitErr) {
            // Commit might fail if there's nothing new to commit
            log(`Commit status: ${commitErr.stdout || (commitErr.error && commitErr.error.message) || 'No new commits'}`);
        }

        if (!hasRemote) {
            log('Notice: Remote "origin" is not configured. Saved commit locally, skipping push.');
            isSyncing = false;
            return;
        }

        // 5. Pull from remote to handle concurrent edits
        log('Pulling latest updates from remote origin...');
        try {
            await runCmd(`git pull --rebase origin ${branch}`);
        } catch (pullErr) {
            log(`Notice during pull: ${pullErr.stderr || (pullErr.error && pullErr.error.message) || pullErr}`);
        }

        // 6. Push to remote origin
        log(`Pushing modifications to origin/${branch}...`);
        try {
            await runCmd(`git push origin ${branch}`);
            log('Auto-sync success: Repository is up to date.');
        } catch (pushErr) {
            log(`Error pushing to remote: ${pushErr.stderr || (pushErr.error && pushErr.error.message) || pushErr}`);
        }
        
    } catch (err) {
        log(`Auto-sync cycle failed: ${err.stderr || (err.error && err.error.message) || err}`);
    } finally {
        isSyncing = false;
    }
}

log('Starting Git Auto-Sync Watcher daemon...');
setInterval(checkSync, CHECK_INTERVAL);

// Check once immediately on start
checkSync();
