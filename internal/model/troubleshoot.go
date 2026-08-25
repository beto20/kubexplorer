package model

type EvidenceItem struct {
	Label string
	Value string
}

type Troubleshoot struct {
	Reason         string
	Severity       string
	Meaning        string
	Recommendation string
	Evidence       []EvidenceItem
}
