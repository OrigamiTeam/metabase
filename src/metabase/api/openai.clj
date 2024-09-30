(ns metabase.api.openai
  (:require [ring.util.http-response :as http-response]
            [clj-http.client :as client]
            [cheshire.core :as json]
            [clojure.string :as str]))

(def forbidden-terms ["INTERVAL" "OUTER JOIN" "CROSS JOIN" "DATE"])

(defn generate-sql-handler
  [request]
  (let [body (:body request)
        ;; api-key "API-KEY"
        openai-url "https://api.openai.com/v1/chat/completions"
        forbidden-terms-string (str/join ", " forbidden-terms)
        payload {:model "gpt-4"
                 :messages [{:role "system" 
                             :content (str "You are a helpful assistant that transforms user questions into SQL queries for the H2 database in Metabase. "
                                           "Avoid using the following terms in the query: " forbidden-terms-string ". "
                                           "You MUST NOT USE INTERVAL or DATE functions that are not supported in H2. "
                                           "Use RECENT SQL patterns for H2. For date calculations, use functions like DATEADD, and handle date components directly if needed, like manipulating year, month, and day fields."
                                           "Ensure the query runs smoothly in H2 without syntax or semantic errors.")}
                            {:role "user" :content (str "Available data: " (:availableData body) ".")}
                            {:role "user" :content (str "User's question: " (:userQuestion body))}
                            {:role "user" :content "Provide only the SQL query that answers this question without additional explanations."}]
                 :max_tokens 150}
        response (client/post openai-url
                              {:headers {"Authorization" (str "Bearer " api-key)
                                         "Content-Type" "application/json"}
                               :body (json/generate-string payload)})
        response-body (json/parse-string (:body response) true)
        raw-sql-query (:content (-> response-body :choices first :message))
        sanitized-sql-query (-> raw-sql-query
                                (str/replace #"```sql" "")
                                (str/replace #"```" "")
                                ;; Substituir qualquer função INTERVAL detectada para algo compatível com H2
                                (str/replace #"INTERVAL\s+'(\d+)\s+(day|days)'" (fn [[_ num]] (str "DATEADD('DAY', -" num ", CURRENT_DATE)"))))]

    (println "Generated SQL Query:" sanitized-sql-query)
    (http-response/ok sanitized-sql-query)))
