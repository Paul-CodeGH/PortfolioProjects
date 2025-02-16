import asyncio
from cpu_monitor import CPUMonitor
from ram_monitor import RAMMonitor
from disk_monitor import DiskMonitor
from gpu_monitor import GPUMonitor

class SystemMonitor:
    def __init__(self):
        self.cpu = CPUMonitor()

        self.ram = RAMMonitor()

        self.disk = DiskMonitor()

        self.gpu = GPUMonitor()
    

    async def monitor_loop(self, update_callback):
        while True:
            data = {
                "cpu": self.cpu.get_usage(),
                "ram": self.ram.get_usage(),
                "gpu": self.gpu.get_usage(),
                "disk": self.disk.get_usage(),
            }
            update_callback(data)
            await asyncio.sleep(0.1)
