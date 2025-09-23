from pynvml import nvmlInit, nvmlSystemGetDriverVersion

def detect_gpu():
    try:
        nvmlInit()
        nvmlSystemGetDriverVersion()
        return True
    except:
        return False
