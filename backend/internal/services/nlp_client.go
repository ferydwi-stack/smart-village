package services

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/desamart/backend/internal/config"
)

// NLPClient handles communication with the Python NLP service
type NLPClient struct {
	BaseURL string
	client  *http.Client
}

// NewNLPClient creates a new instance of NLPClient
func NewNLPClient() *NLPClient {
	cfg := config.LoadConfig()
	return &NLPClient{
		BaseURL: cfg.NLPServiceURL,
		client: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

// NLPResponse represents the response from the NLP service
type NLPResponse struct {
	Kategori   string  `json:"kategori"`
	Confidence float64 `json:"confidence"`
	Response   string  `json:"response"`
}

// ClassifyMessage sends a message to the NLP service for classification
func (c *NLPClient) ClassifyMessage(message string) (*NLPResponse, error) {
	url := c.BaseURL + "/api/classify"
	
	reqBody, _ := json.Marshal(map[string]string{"text": message})
	
	resp, err := c.client.Post(url, "application/json", bytes.NewBuffer(reqBody))
	if err != nil {
		log.Printf("Error calling NLP service: %v", err)
		// Fallback response as requested
		return &NLPResponse{
			Kategori:   "FAQ",
			Confidence: 0,
			Response:   "Maaf, layanan chatbot sedang tidak tersedia. Silakan coba lagi nanti.",
		}, nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("NLP service returned status: %d", resp.StatusCode)
		return &NLPResponse{
			Kategori:   "FAQ",
			Confidence: 0,
			Response:   "Maaf, chatbot sedang dikoordinasikan. Silakan sampaikan pesan Anda sekali lagi.",
		}, nil
	}

	var nlpResp NLPResponse
	if err := json.NewDecoder(resp.Body).Decode(&nlpResp); err != nil {
		return nil, err
	}

	return &nlpResp, nil
}
