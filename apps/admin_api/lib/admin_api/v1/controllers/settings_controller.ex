# Copyright 2018-2019 OmiseGO Pte Ltd
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

defmodule AdminAPI.V1.SettingsController do
  use AdminAPI, :controller
  import AdminAPI.V1.ErrorHandler
  alias EWallet.TokenPolicy
  alias EWalletDB.Token

  def get_settings(conn, _attrs) do
    with {:ok, _} <- authorize(:all, conn.assigns, nil) do
      settings = %{tokens: Token.all()}
      render(conn, :settings, settings)
    else
      {:error, code} ->
        handle_error(conn, code)
    end
  end

  @spec authorize(:all, map(), String.t() | nil) :: any()
  defp authorize(action, actor, token_attrs) do
    TokenPolicy.authorize(action, actor, token_attrs)
  end
end
