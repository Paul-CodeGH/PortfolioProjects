import psutil

class RAMMonitor:
    @staticmethod
    def get_usage():
        return psutil.virtual_memory().percent
