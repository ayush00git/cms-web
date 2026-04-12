package models

import (
	"time"
)

type BlockLabel string
const (
	BlockA BlockLabel = "A"
	BlockB BlockLabel = "B"
	BlockC BlockLabel = "C"
	BlockD BlockLabel = "D"
	BlockE BlockLabel = "E"
	BlockF BlockLabel = "F"
)

type BlockType string
const (
	Type1 BlockType = "1"
	Type2 BlockType = "2"
	Type3 BlockType = "3"
	Type4 BlockType = "4"
	Type5 BlockType = "5"
)

// set one enumerated type for department as well

type Faculty struct {
	ID					uint  			`gorm:"primaryKey;autoIncrement"`
	Name				string			`gorm:"not null"`
	Email				string			`gorm:"uniqueIndex; not null"`
	Department			string			`gorm:"not null"`
	HouseNumber			string			`gorm:"not null"`
	Block				BlockLabel		`gorm:"type:char(1);not null"`
	Type				BlockType		`gorm:"type:char(1);not null"`
	PhoneNumber			string			`gorm:"uniqueIndex;not null"`
	IsVerified			bool  			`gorm:"default:false"`
	CreatedAt			time.Time		
}
