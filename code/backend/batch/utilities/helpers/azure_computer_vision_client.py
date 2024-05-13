import logging
from typing import List
from urllib.parse import urljoin
from azure.identity import DefaultAzureCredential, get_bearer_token_provider

import requests
from requests import Response

from .env_helper import EnvHelper

logger = logging.getLogger(__name__)


class AzureComputerVisionClient:

    __TOKEN_SCOPE = "https://cognitiveservices.azure.com/.default"
    __VECTORIZE_IMAGE_PATH = "computervision/retrieval:vectorizeImage"
    __VECTORIZE_IMAGE_API_VERSION = "2024-02-01"
    __VECTORIZE_IMAGE_MODEL_VERSION = "2023-04-15"
    __RESPONSE_VECTOR_KEY = "vector"

    def __init__(self, env_helper: EnvHelper) -> None:
        self.computer_vision_host = env_helper.AZURE_COMPUTER_VISION_ENDPOINT
        self.computer_vision_timeout = env_helper.AZURE_COMPUTER_VISION_TIMEOUT
        self.computer_vision_key = env_helper.AZURE_COMPUTER_VISION_KEY
        self.use_keys = env_helper.is_auth_type_keys()

    def vectorize_image(self, image_url: str) -> List[float]:
        logger.info(f"Making call to computer vision to vectorize image: {image_url}")
        response = self.__make_request(image_url)
        self.__validate_response(response)

        response_json = self.__get_json_body(response)
        return self.__get_vectors(response_json)

    def __make_request(self, image_url: str) -> Response:
        try:
            headers = {}
            if self.use_keys:
                headers["Ocp-Apim-Subscription-Key"] = self.computer_vision_key
            else:
                token_provider = get_bearer_token_provider(
                    DefaultAzureCredential(), self.__TOKEN_SCOPE
                )
                headers["Authorization"] = "Bearer " + token_provider()

            return requests.post(
                url=urljoin(self.computer_vision_host, self.__VECTORIZE_IMAGE_PATH),
                params={
                    "api-version": self.__VECTORIZE_IMAGE_API_VERSION,
                    "model-version": self.__VECTORIZE_IMAGE_MODEL_VERSION,
                },
                json={"url": image_url},
                headers=headers,
                timeout=self.computer_vision_timeout,
            )
        except Exception as e:
            raise Exception("Call to vectorize image failed") from e

    def __validate_response(self, response: Response):
        if response.status_code != 200:
            raise Exception(
                f"Call to vectorize image failed with status: {response.status_code} body: {response.text}"
            )

    def __get_json_body(self, response: Response) -> dict:
        try:
            return response.json()
        except Exception as e:
            raise Exception(
                f"Call to vectorize image returned malformed response body: {response.text}",
            ) from e

    def __get_vectors(self, response_json: dict) -> List[float]:
        if self.__RESPONSE_VECTOR_KEY in response_json:
            return response_json[self.__RESPONSE_VECTOR_KEY]
        else:
            raise Exception(
                f"Call to vectorize image returned no vector: {response_json}"
            )
