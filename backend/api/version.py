"""Project version loaded from the repository-level VERSION file."""

from pathlib import Path


def get_project_version() -> str:
    version_file = Path(__file__).resolve().parents[2] / "VERSION"
    try:
        return version_file.read_text(encoding="utf-8").strip()
    except OSError:
        return "0.0.0-dev"


PROJECT_VERSION = get_project_version()
