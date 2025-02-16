import psutil

class DiskMonitor:
    @staticmethod
    def get_usage():
        return [
            (disk.device, psutil.disk_usage(disk.mountpoint).percent)
            for disk in psutil.disk_partitions(all=False)
        ]
