import os
import subprocess
import sys

# 强制 line buffering，确保后台 task 日志实时写入可见，避免缓冲导致
try:
    sys.stdout.reconfigure(line_buffering=True)
    sys.stderr.reconfigure(line_buffering=True)
except Exception:
    pass

# 强力设定离线模式，避免 HuggingFace 联网检查超时导致卡顿
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

# 限制 PyTorch / OpenBLAS 线程数，防止在沙盒后台执行时发生 OMP 线程池死锁
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

if __name__ == "__main__":
    args = [sys.executable, "-m", "pytest"] + sys.argv[1:]
    print(f"Running command: {' '.join(args)}")
    result = subprocess.run(args)
    sys.exit(result.returncode)
