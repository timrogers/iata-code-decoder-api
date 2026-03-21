
import http.client
import time
import statistics
import json

def benchmark(url, name, iterations=50):
    print(f"Benchmarking {name} ({url})...")
    latencies = []

    # Warmup
    try:
        conn = http.client.HTTPConnection("localhost", 3000)
        conn.request("GET", url)
        conn.getresponse().read()
        conn.close()
    except Exception as e:
        print(f"Error during warmup: {e}")
        return

    for _ in range(iterations):
        start = time.perf_counter()
        try:
            conn = http.client.HTTPConnection("localhost", 3000)
            conn.request("GET", url)
            resp = conn.getresponse()
            data = resp.read()
            conn.close()
            end = time.perf_counter()
            latencies.append((end - start) * 1000)
        except Exception as e:
            print(f"Error during benchmark: {e}")

    if latencies:
        print(f"  Avg: {statistics.mean(latencies):.2f}ms")
        print(f"  Min: {min(latencies):.2f}ms")
        print(f"  Max: {max(latencies):.2f}ms")
        print(f"  P95: {statistics.quantiles(latencies, n=20)[18]:.2f}ms")
    else:
        print("  No successful requests.")

if __name__ == "__main__":
    # Wait for server to be up
    time.sleep(2)
    benchmark("/airports?query=LHR", "Airport LHR (Exact)")
    benchmark("/airports?query=L", "Airport L (Partial)")
    benchmark("/airlines?query=BA", "Airline BA (Exact)")
    benchmark("/aircraft?query=777", "Aircraft 777 (Exact)")
