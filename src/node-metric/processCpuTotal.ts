import { Meter, MetricAttributes } from '@opentelemetry/api';

const PROCESS_CPU_USER_SECONDS = 'process_cpu_user_seconds_total';
const PROCESS_CPU_SYSTEM_SECONDS = 'process_cpu_system_seconds_total';
const PROCESS_CPU_SECONDS = 'process_cpu_seconds_total';

export const processCpuTotal: (
  Meter: Meter,
  config: {
    prefix?: string;
    labels?: MetricAttributes;
  },
) => void = (meter, { prefix, labels }) => {
  let lastCpuUsage = process.cpuUsage();

  const cpuUserUsageCounter = meter.createCounter(
    prefix + PROCESS_CPU_USER_SECONDS,
    {
      description: 'Total user CPU time spent in seconds.',
    },
  );

  const cpuSystemUsageCounter = meter.createCounter(
    prefix + PROCESS_CPU_SYSTEM_SECONDS,
    {
      description: 'Total system CPU time spent in seconds.',
    },
  );

  meter
    .createObservableCounter(prefix + PROCESS_CPU_SECONDS, {
      description: 'Total user and system CPU time spent in seconds.',
    })
    .addCallback((observable) => {
      const cpuUsage = process.cpuUsage();
      const userUsageSecs = (cpuUsage.user - lastCpuUsage.user) / 1e6;
      const systemUsageSecs = (cpuUsage.system - lastCpuUsage.system) / 1e6;
      lastCpuUsage = cpuUsage;

      cpuUserUsageCounter.add(userUsageSecs, labels);
      cpuSystemUsageCounter.add(systemUsageSecs, labels);
      observable.observe((cpuUsage.user + cpuUsage.system) / 1e6, labels);
    });

  cpuUserUsageCounter.add(lastCpuUsage.user / 1e6, labels);
  cpuSystemUsageCounter.add(lastCpuUsage.system / 1e6, labels);
};

export const metricNames = [
  PROCESS_CPU_USER_SECONDS,
  PROCESS_CPU_SYSTEM_SECONDS,
  PROCESS_CPU_SECONDS,
];
