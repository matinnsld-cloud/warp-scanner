#!/usr/bin/env node

const net = require('net');
const http = require('http');
const fs = require('fs');
const { performance } = require('perf_hooks');
const pLimit = require('p-limit');

// Configuration
const IP_RANGES = [
    "162.159.192.0/24",
    "162.159.193.0/24",
    "162.159.195.0/24",
    "162.159.204.0/24",
    "188.114.96.0/24",
    "188.114.97.0/24",
    "188.114.98.0/24",
    "188.114.99.0/24",
];

const PORTS = [
    854, 859, 864, 878, 880, 890, 891, 894, 903, 908, 928, 934, 939, 942, 943, 945,
    946, 955, 968, 987, 988, 1002, 1010, 1014, 1018, 1070, 1074, 1180, 1387, 1843,
    2371, 2506, 3138, 3476, 3581, 3854, 4177, 4198, 4233, 5279, 5956, 7103, 7152,
    7156, 7281, 7559, 8319, 8742, 8854, 8886
];

const TIMEOUT = 3000; // 3 seconds
const MIN_SPEED = 100; // 100 KB/s
const CONCURRENT = 16; // 16 concurrent scans
const TEST_SIZE = 1024 * 100; // 100 KB test file

// Helper functions
function ipToNumber(ip) {
    const parts = ip.split('.');
    return (parseInt(parts[0]) << 24) + (parseInt(parts[1]) << 16) + 
           (parseInt(parts[2]) << 8) + parseInt(parts[3]);
}

function numberToIp(num) {
    return `${(num >>> 24) & 0xFF}.${(num >>> 16) & 0xFF}.${(num >>> 8) & 0xFF}.${num & 0xFF}`;
}

function parseCIDR(cidr) {
    const [ip, mask] = cidr.split('/');
    const maskBits = parseInt(mask);
    const ipNum = ipToNumber(ip);
    const maskNum = (0xFFFFFFFF << (32 - maskBits)) >>> 0;
    const networkNum = ipNum & maskNum;
    const broadcastNum = networkNum | ~maskNum;
    
    const ips = [];
    for (let i = networkNum + 1; i < broadcastNum; i++) {
        ips.push(numberToIp(i));
    }
    return ips;
}

function testPing(ip, port) {
    return new Promise((resolve) => {
        const startTime = performance.now();
        const socket = new net.Socket();
        
        socket.setTimeout(TIMEOUT);
        
        socket.on('connect', () => {
            const latency = Math.round(performance.now() - startTime);
            socket.destroy();
            resolve({ success: true, latency });
        });
        
        socket.on('timeout', () => {
            socket.destroy();
            resolve({ success: false, latency: null });
        });
        
        socket.on('error', () => {
            socket.destroy();
            resolve({ success: false, latency: null });
        });
        
        socket.connect(port, ip);
    });
}

function testSpeed(ip, port) {
    return new Promise((resolve) => {
        const startTime = performance.now();
        let receivedBytes = 0;
        
        const options = {
            hostname: ip,
            port: port,
            path: '/',
            method: 'GET',
            timeout: TIMEOUT
        };
        
        const req = http.request(options, (res) => {
            res.on('data', (chunk) => {
                receivedBytes += chunk.length;
            });
            
            res.on('end', () => {
                const duration = (performance.now() - startTime) / 1000; // seconds
                const speedKBs = (receivedBytes / 1024) / duration;
                resolve({ success: true, speed: Math.round(speedKBs), bytes: receivedBytes });
            });
        });
        
        req.on('timeout', () => {
            req.destroy();
            resolve({ success: false, speed: 0, bytes: 0 });
        });
        
        req.on('error', () => {
            resolve({ success: false, speed: 0, bytes: 0 });
        });
        
        req.end();
    });
}

async function scanEndpoint(ip, port) {
    // Test connectivity
    const pingResult = await testPing(ip, port);
    
    if (!pingResult.success) {
        return null;
    }
    
    // Test speed
    const speedResult = await testSpeed(ip, port);
    
    if (!speedResult.success || speedResult.speed < MIN_SPEED) {
        return null;
    }
    
    return {
        ip,
        port,
        latency: pingResult.latency,
        speed: speedResult.speed,
        timestamp: new Date().toISOString()
    };
}

async function main() {
    console.log('🚀 Warp Endpoint Scanner Started\n');
    console.log(`📊 Configuration:`);
    console.log(`   - IP Ranges: ${IP_RANGES.length} ranges`);
    console.log(`   - Ports: ${PORTS.length} ports`);
    console.log(`   - Timeout: ${TIMEOUT}ms`);
    console.log(`   - Min Speed: ${MIN_SPEED} KB/s`);
    console.log(`   - Concurrent: ${CONCURRENT}\n`);
    
    // Generate all IPs
    console.log('📍 Generating IP addresses...');
    let allIPs = [];
    for (const range of IP_RANGES) {
        const ips = parseCIDR(range);
        allIPs = allIPs.concat(ips);
    }
    console.log(`✅ Total IPs to scan: ${allIPs.length}\n`);
    
    // Create scan tasks
    const tasks = [];
    for (const ip of allIPs) {
        for (const port of PORTS) {
            tasks.push({ ip, port });
        }
    }
    
    console.log(`🔍 Starting scan (${tasks.length} tasks)...\n`);
    
    const limit = pLimit(CONCURRENT);
    const results = [];
    let processed = 0;
    const totalTasks = tasks.length;
    
    const startTime = performance.now();
    
    const promises = tasks.map(task =>
        limit(async () => {
            const result = await scanEndpoint(task.ip, task.port);
            processed++;
            
            // Progress indicator
            if (processed % 100 === 0) {
                const progress = Math.round((processed / totalTasks) * 100);
                const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
                process.stdout.write(`\r📊 Progress: ${progress}% (${processed}/${totalTasks}) - ${elapsed}s`);
            }
            
            if (result) {
                results.push(result);
            }
            
            return result;
        })
    );
    
    await Promise.all(promises);
    
    const totalTime = ((performance.now() - startTime) / 1000).toFixed(2);
    
    console.log(`\n\n✅ Scan Complete!\n`);
    console.log(`📈 Statistics:`);
    console.log(`   - Total scanned: ${totalTasks}`);
    console.log(`   - Found: ${results.length}`);
    console.log(`   - Success rate: ${((results.length / totalTasks) * 100).toFixed(2)}%`);
    console.log(`   - Time: ${totalTime}s\n`);
    
    // Sort results by speed (fastest first)
    results.sort((a, b) => b.speed - a.speed);
    
    // Generate report
    let report = `Warp Endpoint Scanner Results\n`;
    report += `Generated: ${new Date().toISOString()}\n`;
    report += `Total Found: ${results.length}\n`;
    report += `========================================\n\n`;
    
    report += `IP:PORT | Latency(ms) | Speed(KB/s)\n`;
    report += `----------------------------------------\n`;
    
    results.forEach(result => {
        report += `${result.ip}:${result.port} | ${result.latency}ms | ${result.speed} KB/s\n`;
    });
    
    // Save to file
    const filename = `results-${Date.now()}.txt`;
    fs.writeFileSync(filename, report);
    
    console.log(`💾 Results saved to: ${filename}\n`);
    
    // Show top 10
    console.log(`🏆 Top 10 Fastest Endpoints:\n`);
    results.slice(0, 10).forEach((result, index) => {
        console.log(`${index + 1}. ${result.ip}:${result.port} - ${result.speed} KB/s (${result.latency}ms)`);
    });
}

main().catch(console.error);
