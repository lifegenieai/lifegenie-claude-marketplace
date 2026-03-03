# Scenario 3: Factual Preservation Under Aggressive Transformation

## Setup

Create a source file `technical-report.md` with dense factual content that must
survive an aggressive voice transformation:

```markdown
# PostgreSQL 16 Performance Analysis: TPC-C Benchmarks on ARM64

## Test Configuration

All benchmarks ran on AWS Graviton3 instances (c7g.8xlarge: 32 vCPUs, 64 GB
RAM) running Amazon Linux 2023. PostgreSQL 16.2 was compiled from source with
-O2 -march=armv8.4-a+crypto+sve. The TPC-C workload used 500 warehouses with
100 concurrent connections over a 2-hour steady-state window after a 30-minute
warmup.

Storage was io2 Block Express with 64,000 provisioned IOPS and 1,000 MB/s
throughput. WAL was on a separate io2 volume (16,000 IOPS). shared_buffers was
set to 16 GB (25% of RAM), effective_cache_size to 48 GB, and work_mem to
64 MB.

## Results

PostgreSQL 16 on ARM64 achieved 287,431 tpmC (transactions per minute, type C),
a 23.7% improvement over PostgreSQL 15.4 on identical hardware. The p99 latency
for New Order transactions was 12.3 ms (down from 18.9 ms in PG 15.4).

The deadlock rate dropped from 0.0034% to 0.0009% of total transactions,
attributable to the new LWLock implementation (commit a]b7c2e3f) that reduces
false contention on SLRU buffer locks.

Notable per-transaction breakdown:
- New Order: 44.8% of mix (target: 45%)
- Payment: 43.1% of mix (target: 43%)
- Order Status: 4.1% of mix (target: 4%)
- Delivery: 4.2% of mix (target: 4%)
- Stock Level: 3.8% of mix (target: 4%)

## Resource Utilization

Average CPU utilization was 73.2% across all 32 vCPUs during steady state, with
peak utilization of 89.4% during checkpoint activity. The SVE (Scalable Vector
Extension) instructions provided a measurable benefit for hash joins: the
vectorized hash computation reduced probe time by 14.6% compared to the scalar
fallback, verified by toggling the jit_provider GUC.

Memory pressure remained low: resident set size stabilized at 41.3 GB after
warmup. The OS page cache served 94.7% of read requests, with io2 handling the
remaining 5.3% at an average latency of 0.4 ms.

## Cost Analysis

The c7g.8xlarge instance costs $0.9728/hour in us-east-1. At 287,431 tpmC, the
cost-per-transaction is $0.0000034. The equivalent x86 instance (c6i.8xlarge at
$1.088/hour) achieved 233,018 tpmC on PostgreSQL 16, yielding a cost-per-
transaction of $0.0000047. ARM64 is 27.5% cheaper per transaction.

Total benchmark infrastructure cost for the 2.5-hour run: $2.43 (compute) +
$1.87 (storage) = $4.30.
```

## Task

Run the copy-editor in Transform mode with an aggressive voice change. Use the
`john-roberts` named style, which favors conversational, premise-driven prose:

```
/copy-editor john-roberts technical-report.md output.md make conversational and engaging while preserving every single number
```

This is the hardest test: the john-roberts voice is informal and conversational,
while the source is dense with precise technical data. Every number, percentage,
configuration value, commit hash, instance type, and measurement must survive
the transformation exactly. The voice should change dramatically; the data
must not change at all.
