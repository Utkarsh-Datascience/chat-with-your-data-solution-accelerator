from backend.batch.utilities.search.SearchHandlerBase import SearchHandlerBase
from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential
from azure.identity import DefaultAzureCredential
import re


class IntegratedVectorizationSearchHandler(SearchHandlerBase):
    def create_search_client(self):
        return SearchClient(
            endpoint=self.env_helper.AZURE_SEARCH_SERVICE,
            index_name=self.env_helper.AZURE_SEARCH_INDEX,
            credential=(
                AzureKeyCredential(self.env_helper.AZURE_SEARCH_KEY)
                if self.env_helper.is_auth_type_keys()
                else DefaultAzureCredential()
            ),
        )

    def perform_search(self, filename):
        return self.search_client.search(
            search_text="*",
            select=["id", "chunk_id", "content"],
            filter=f"title eq '{filename}'",
        )

    def process_results(self, results):
        data = [
            [re.findall(r"\d+", result["chunk_id"])[-1], result["content"]]
            for result in results
        ]
        return data

    def get_files(self):
        return self.search_client.search(
            "*", select="id, chunk_id, title", include_total_count=True
        )

    def output_results(self, results):
        files = {}
        for result in results:
            id = result["chunk_id"]
            filename = result["title"]
            if filename in files:
                files[filename].append(id)
            else:
                files[filename] = [id]

        return files

    def delete_files(self, files):
        ids_to_delete = []
        files_to_delete = []

        for filename, ids in files.items():
            files_to_delete.append(filename)
            ids_to_delete += [{"chunk_id": id} for id in ids]

        self.search_client.delete_documents(ids_to_delete)

        return ", ".join(files_to_delete)
