package models

import (
	"time"
)

type PositionType string
const (
	TypeXENCivil 		PositionType = "XEN_Civil"
	TypeAECivil 		PositionType = "AE_Civil"
	TypeJECivil 		PositionType = "JE_Civil"
	TypeXENElectrical 	PositionType = "XEN_Electrical"
	TypeAEElectrical 	PositionType = "AE_Electrical"
	TypeJEElectrical 	PositionType = "JE_Electrical"
)

type Admin struct {
	ID				uint			`gorm:"primaryKey;autoIncrement" json:"id"`
	Email			string			`gorm:"uniqueIndex;not null" json:"email"`
	Password		string			`gorm:"not null" json:"password"`
	Position		PositionType	`gorm:"type:varchar(15);not null" json:"position"`
	IsVerified		bool			`gorm:"default:false" json:"is_verified"`
	CreatedAt		time.Time		`json:"created_at"`
}

type AdminLogin struct {
	Email			string			`json:"email" binding:"required"`
	Password		string			`json:"password" binding:"required"`
}
