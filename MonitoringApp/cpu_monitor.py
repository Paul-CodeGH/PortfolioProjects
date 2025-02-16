import psutil

class CPUMonitor:
    @staticmethod
    def get_usage():
        return psutil.cpu_percent(interval=0.5)
