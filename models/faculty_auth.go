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

type DepartmentName string
const (
	CSE  DepartmentName = "Computer Science & Engineering"
	CE   DepartmentName = "Civil Engineering"
	CHE  DepartmentName = "Chemical Engineering"
	ECE  DepartmentName = "Electronics & Communication Engineering"
	EE   DepartmentName = "Electrical Engineering"
	ME   DepartmentName = "Mechanical Engineering"
	MSE  DepartmentName = "Material Science & Engineering"
	CHEM DepartmentName = "Chemistry"
	MSC  DepartmentName = "Mathematics & Scientific Computing"
	PPS  DepartmentName = "Physics & Photonics Science"
	ARCH DepartmentName = "Architecture"
	HSS  DepartmentName = "Humanities & Social Sciences"
	MS   DepartmentName = "Management Studies"
	CES  DepartmentName = "Centre For Energy Studies"
)

type Faculty struct {
	ID					uint  			`gorm:"primaryKey;autoIncrement" json:"id"`
	Name				string			`gorm:"not null" json:"name"`
	Email				string			`gorm:"uniqueIndex;not null" json:"email"`
	Password			string			`gorm:"not null" json:"password"`
	Department			DepartmentName	`gorm:"type:varchar(40);not null" json:"department"`
	HouseNumber			string			`gorm:"not null" json:"house_number"`
	Block				BlockLabel		`gorm:"type:char(1);not null" json:"block"`
	Type				BlockType		`gorm:"type:char(1);not null" json:"type"`
	PhoneNumber			string			`gorm:"type:char(10);uniqueIndex;not null" json:"phone_number"`
	IsVerified			bool  			`gorm:"default:false" json:"is_verified"`
	CreatedAt			time.Time		`json:"created_at"`
}
