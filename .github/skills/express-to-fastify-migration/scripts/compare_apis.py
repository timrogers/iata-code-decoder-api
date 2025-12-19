#!/usr/bin/env python3
"""
API Comparison Script
Compares responses between Express and Fastify servers to ensure migration correctness.
"""

import requests
import json
import sys
from typing import Dict, List, Tuple
from urllib.parse import urljoin
import argparse
from deepdiff import DeepDiff


class APIComparator:
    def __init__(self, express_base: str, fastify_base: str, verbose: bool = False):
        self.express_base = express_base.rstrip('/')
        self.fastify_base = fastify_base.rstrip('/')
        self.verbose = verbose
        self.results = []
    
    def compare_endpoint(self, method: str, path: str, 
                        body: Dict = None, 
                        headers: Dict = None,
                        params: Dict = None) -> Dict:
        """Compare a single endpoint between Express and Fastify."""
        
        express_url = urljoin(self.express_base, path)
        fastify_url = urljoin(self.fastify_base, path)
        
        if self.verbose:
            print(f"\n🔍 Testing {method.upper()} {path}")
        
        try:
            # Make requests to both servers
            express_resp = requests.request(
                method, express_url, 
                json=body, 
                headers=headers,
                params=params,
                timeout=10
            )
            
            fastify_resp = requests.request(
                method, fastify_url, 
                json=body, 
                headers=headers,
                params=params,
                timeout=10
            )
            
            # Compare status codes
            status_match = express_resp.status_code == fastify_resp.status_code
            
            # Compare response bodies
            try:
                express_json = express_resp.json()
                fastify_json = fastify_resp.json()
                body_diff = DeepDiff(express_json, fastify_json, ignore_order=True)
                body_match = len(body_diff) == 0
            except json.JSONDecodeError:
                express_json = express_resp.text
                fastify_json = fastify_resp.text
                body_match = express_json == fastify_json
                body_diff = None if body_match else {"text_diff": True}
            
            # Compare headers (only relevant ones)
            relevant_headers = ['content-type', 'content-length']
            header_diff = {}
            for header in relevant_headers:
                exp_h = express_resp.headers.get(header)
                fast_h = fastify_resp.headers.get(header)
                if exp_h != fast_h:
                    header_diff[header] = {"express": exp_h, "fastify": fast_h}
            
            result = {
                "method": method.upper(),
                "path": path,
                "status_match": status_match,
                "body_match": body_match,
                "headers_match": len(header_diff) == 0,
                "express_status": express_resp.status_code,
                "fastify_status": fastify_resp.status_code,
                "body_diff": body_diff,
                "header_diff": header_diff,
                "success": status_match and body_match
            }
            
            if self.verbose:
                if result["success"]:
                    print("  ✅ Match")
                else:
                    print(f"  ❌ Mismatch")
                    if not status_match:
                        print(f"     Status: Express={express_resp.status_code}, Fastify={fastify_resp.status_code}")
                    if not body_match:
                        print(f"     Body differs: {body_diff}")
            
            self.results.append(result)
            return result
            
        except requests.exceptions.RequestException as e:
            error_result = {
                "method": method.upper(),
                "path": path,
                "success": False,
                "error": str(e)
            }
            self.results.append(error_result)
            if self.verbose:
                print(f"  ❌ Error: {e}")
            return error_result
    
    def run_test_suite(self, endpoints: List[Dict]) -> bool:
        """Run a full test suite of endpoints."""
        
        print(f"\n🚀 Running API Comparison")
        print(f"Express:  {self.express_base}")
        print(f"Fastify:  {self.fastify_base}")
        print(f"Endpoints: {len(endpoints)}\n")
        
        for endpoint in endpoints:
            self.compare_endpoint(
                method=endpoint.get('method', 'GET'),
                path=endpoint['path'],
                body=endpoint.get('body'),
                headers=endpoint.get('headers'),
                params=endpoint.get('params')
            )
        
        # Summary
        total = len(self.results)
        passed = sum(1 for r in self.results if r.get("success", False))
        failed = total - passed
        
        print(f"\n{'='*60}")
        print(f"📊 Results Summary")
        print(f"{'='*60}")
        print(f"Total:  {total}")
        print(f"Passed: {passed} ({100*passed/total:.1f}%)")
        print(f"Failed: {failed} ({100*failed/total:.1f}%)")
        
        if failed > 0:
            print(f"\n❌ Failed endpoints:")
            for result in self.results:
                if not result.get("success", False):
                    print(f"  - {result['method']} {result['path']}")
                    if 'error' in result:
                        print(f"    Error: {result['error']}")
                    else:
                        if not result.get('status_match', True):
                            print(f"    Status mismatch: {result['express_status']} vs {result['fastify_status']}")
                        if not result.get('body_match', True):
                            print(f"    Body differs")
        
        return failed == 0
    
    def export_report(self, filename: str = "migration_report.json"):
        """Export detailed comparison report."""
        report = {
            "express_base": self.express_base,
            "fastify_base": self.fastify_base,
            "total_tests": len(self.results),
            "passed": sum(1 for r in self.results if r.get("success", False)),
            "results": self.results
        }
        
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📄 Detailed report saved to: {filename}")


def main():
    parser = argparse.ArgumentParser(description='Compare Express and Fastify API responses')
    parser.add_argument('--express', required=True, help='Express server base URL')
    parser.add_argument('--fastify', required=True, help='Fastify server base URL')
    parser.add_argument('--config', required=True, help='Test configuration JSON file')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    parser.add_argument('--report', default='migration_report.json', help='Output report filename')
    
    args = parser.parse_args()
    
    # Load test configuration
    with open(args.config, 'r') as f:
        endpoints = json.load(f)
    
    # Run comparison
    comparator = APIComparator(args.express, args.fastify, verbose=args.verbose)
    success = comparator.run_test_suite(endpoints)
    comparator.export_report(args.report)
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
