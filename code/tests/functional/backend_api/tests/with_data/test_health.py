import pytest
import requests

from tests.functional.backend_api.app_config import AppConfig

pytestmark = pytest.mark.functional


def test_health(app_url: str, app_config: AppConfig):
    # when
    response = requests.get(f"{app_url}/health")

    # then
    assert response.status_code == 200
    assert response.text == "OK"
