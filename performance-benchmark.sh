#!/bin/bash

# Performance Testing Script
# Runs benchmarks before and after optimizations to measure improvements

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "IATA Code Decoder API"
echo "Performance Benchmark Suite"
echo "======================================"
echo ""

# Configuration
HOST="http://localhost:3000"
DURATION=30  # seconds
CONNECTIONS=10

# Check if server is running
echo -e "${BLUE}Checking if server is running...${NC}"
if ! curl -s "${HOST}/health" > /dev/null; then
    echo "Error: Server not running at ${HOST}"
    echo "Start the server with: npm start"
    exit 1
fi
echo -e "${GREEN}✓ Server is running${NC}"
echo ""

# Function to run benchmark
run_benchmark() {
    local name=$1
    local url=$2
    local connections=${3:-$CONNECTIONS}
    local duration=${4:-$DURATION}
    
    echo -e "${YELLOW}Testing: ${name}${NC}"
    echo "URL: ${url}"
    echo "Connections: ${connections}, Duration: ${duration}s"
    echo ""
    
    npx autocannon \
        -c "${connections}" \
        -d "${duration}" \
        "${url}" \
        2>/dev/null | grep -A 10 "Stat " || echo "Benchmark completed"
    
    echo ""
    echo "---"
    echo ""
}

# Benchmark suite
echo -e "${BLUE}=== Starting Benchmark Suite ===${NC}"
echo ""

# 1. Health endpoint (baseline)
run_benchmark "Health Endpoint" "${HOST}/health" 10 10

# 2. Specific airport lookup (low result count)
run_benchmark "Specific Airport (LON)" "${HOST}/airports?query=LON" 10 15

# 3. Broad airport query (high result count)
run_benchmark "Broad Airport Query (L)" "${HOST}/airports?query=L" 10 15

# 4. Exact airport match
run_benchmark "Exact Airport (LHR)" "${HOST}/airports?query=LHR" 10 15

# 5. Airlines with query
run_benchmark "Airlines Query (A)" "${HOST}/airlines?query=A" 10 15

# 6. All airlines (no query)
run_benchmark "All Airlines" "${HOST}/airlines?query=" 10 15

# 7. Aircraft query
run_benchmark "Aircraft Query (7)" "${HOST}/aircraft?query=7" 10 15

# High concurrency test
echo -e "${BLUE}=== High Concurrency Tests ===${NC}"
echo ""

run_benchmark "High Concurrency - Specific Query" "${HOST}/airports?query=LON" 100 20
run_benchmark "High Concurrency - Broad Query" "${HOST}/airports?query=L" 100 20

# Stress test
echo -e "${BLUE}=== Stress Test ===${NC}"
echo ""

run_benchmark "Stress Test" "${HOST}/airports?query=LHR" 500 30

# Compression test
echo -e "${BLUE}=== Compression Test ===${NC}"
echo ""

echo "Testing compression effectiveness..."
echo ""

UNCOMPRESSED=$(curl -s "${HOST}/airports?query=L" | wc -c)
COMPRESSED=$(curl -s -H "Accept-Encoding: gzip" "${HOST}/airports?query=L" --compressed | wc -c)

echo "Response size for query 'L':"
echo "  Uncompressed: ${UNCOMPRESSED} bytes"
echo "  Compressed: ${COMPRESSED} bytes"
echo "  Compression ratio: $(echo "scale=1; (1 - $COMPRESSED / $UNCOMPRESSED) * 100" | bc)%"
echo ""

# Cache test (if caching implemented)
echo -e "${BLUE}=== Cache Performance Test ===${NC}"
echo ""

echo "Testing cache effectiveness (same query repeated 1000 times)..."
echo ""

CACHE_START=$(date +%s%N)
for i in {1..1000}; do
    curl -s "${HOST}/airports?query=LHR" > /dev/null
done
CACHE_END=$(date +%s%N)

CACHE_DURATION=$(( (CACHE_END - CACHE_START) / 1000000 ))
AVG_TIME=$(echo "scale=2; $CACHE_DURATION / 1000" | bc)

echo "1000 requests completed in ${CACHE_DURATION}ms"
echo "Average time per request: ${AVG_TIME}ms"
echo "Throughput: $(echo "scale=0; 1000000 / $AVG_TIME" | bc) req/sec"
echo ""

# Summary
echo -e "${GREEN}======================================"
echo "Benchmark Suite Complete"
echo "======================================${NC}"
echo ""
echo "Next steps:"
echo "1. Implement optimizations from PERFORMANCE_ANALYSIS.md"
echo "2. Re-run this script to measure improvements"
echo "3. Compare results to validate optimization impact"
echo ""
echo "Expected improvements after optimizations:"
echo "  • Broad queries (L): 523 → 2,500+ req/sec (5x)"
echo "  • Specific queries (LON): 2,079 → 10,000+ req/sec (5x)"
echo "  • Cache hits: → 30,000+ req/sec (15x)"
echo ""
