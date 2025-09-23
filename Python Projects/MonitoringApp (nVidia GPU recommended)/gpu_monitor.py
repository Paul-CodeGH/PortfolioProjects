from pynvml import nvmlInit, nvmlDeviceGetHandleByIndex, nvmlDeviceGetMemoryInfo, nvmlShutdown
from utils import detect_gpu

class GPUMonitor:
    def __init__(self):
        self.gpu_available = detect_gpu()
        if self.gpu_available:
            nvmlInit()

    def get_usage(self):
        if not self.gpu_available:
            return "GPU Not Available"
        handle = nvmlDeviceGetHandleByIndex(0)
        info = nvmlDeviceGetMemoryInfo(handle)
        return round((info.used / info.total) * 100, 2)
