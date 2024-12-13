(ns metabase.api.openai
  (:require [ring.util.http-response :as http-response]
            [clj-http.client :as client]
            [cheshire.core :as json]
            [clojure.string :as str]))

(defn format-available-data [data]
  (println "Raw data received in format-available-data:" data)
  (println "Data type:" (type data))
  (if (string? data)
    data
    (try
      (let [tables (get-in data [0 :tables])]
        (println "Tables extracted:" tables)
        (if (sequential? tables)
          (str/join ", " tables)
          ""))
      (catch Exception e
        (println "Error formatting data:" (ex-message e))
        ""))))

(defn generate-sql-handler
  [request]
  (try
    (let [body (:body request)
          _ (println "
=== Debug Information ===")
          _ (println "Full request body:" body)
          _ (println "Available Data from body:" (:availableData body))
          _ (println "Type of Available Data:" (type (:availableData body)))
          _ (println "========================
")
          
          user-question (str (:userQuestion body))
          available-data (format-available-data (:availableData body))
          
          sql-generator-url "http://localhost:4000/api/generate-sql"
          payload {:availableData (if (empty? available-data)
                                  "ACCOUNTS (campos: ID, EMAIL, FIRST_NAME, LAST_NAME, PLAN, SOURCE, SEATS, CREATED_AT, TRIAL_ENDS_AT, CANCELED_AT, TRIAL_CONVERTED, ACTIVE_SUBSCRIPTION, LEGACY_PLAN, LATITUDE, LONGITUDE, COUNTRY), ANALYTIC_EVENTS (campos: ID, ACCOUNT_ID, EVENT, TIMESTAMP, PAGE_URL, BUTTON_LABEL), FEEDBACK (campos: ID, ACCOUNT_ID, EMAIL, DATE_RECEIVED, RATING, RATING_MAPPED, BODY), INVOICES (campos: ID, ACCOUNT_ID, PAYMENT, EXPECTED_INVOICE, PLAN, DATE_RECEIVED), ORDERS (campos: ID, USER_ID, PRODUCT_ID, SUBTOTAL, TAX, TOTAL, DISCOUNT, CREATED_AT, QUANTITY), PEOPLE (campos: ID, ADDRESS, EMAIL, PASSWORD, NAME, CITY, LONGITUDE, STATE, SOURCE, BIRTH_DATE, ZIP, LATITUDE, CREATED_AT), PRODUCTS (campos: ID, EAN, TITLE, CATEGORY, VENDOR, PRICE, RATING, CREATED_AT), REVIEWS (campos: ID, PRODUCT_ID, REVIEWER, RATING, BODY, CREATED_AT)"
                                  available-data)
                  :userQuestion user-question}
          _ (println "Final payload being sent:" payload) 
          response (client/post sql-generator-url
                              {:content-type :json
                               :accept :json
                               :headers {"x-api-key" "quai44TSqyVyRrWwoQGm6aLaj1lcBIqPhg1Xk6LLP4n1RFrtrvKHvIqshedm8a3i"}
                               :body (json/generate-string payload)})
          response-body (json/parse-string (:body response) true)
          sql-query (:sql response-body)]
      
      (println "Generated SQL Query:" sql-query)
      
      (cond
        (or (= sql-query "Bad Request")
            (nil? sql-query)
            (empty? sql-query))
        (http-response/bad-request 
         {:error "Unable to generate SQL query. Please provide more details or rephrase your question."})

        :else
        (http-response/ok sql-query)))
    
    (catch Exception e
      (println "
=== Error Information ===")
      (println "Error generating SQL:" (ex-message e))
      (let [error-body (-> e ex-data :body)]
        (println "Full error response:" error-body)
        (println "Error data:" (ex-data e))
        (println "======================
"))
      (let [error-response (try 
                            (-> e 
                                ex-data 
                                :body 
                                (json/parse-string true))
                            (catch Exception _ nil))]
        (if (= (:sql error-response) "Bad Request")
          (http-response/bad-request 
           {:error "Unable to generate SQL query. Please provide more details or rephrase your question."})
          (http-response/internal-server-error 
           {:error "An error occurred while processing your request. Please try again."}))))))

