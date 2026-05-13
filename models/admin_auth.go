package models

import (
	"time"
)

type PostType string
const (
	TypeXENCivil 		PostType = "XEN_Civil"
	TypeAECivil 		PostType = "AE_Civil"
	TypeJECivil 		PostType = "JE_Civil"
	TypeXENElectrical 	PostType = "XEN_Electrical"
	TypeAEElectrical 	PostType = "AE_Electrical"
	TypeJEElectrical 	PostType = "JE_Electrical"
)

type Admin struct {
	ID				uint			`gorm:"primaryKey;autoIncrement" json:"id"`
	Email			string			`gorm:"uniqueIndex;not null" json:"email"`
	Password		string			`gorm:"not null" json:"password"`
	Post			PostType		`gorm:"type:varchar(15);unique;not null" json:"post"`
	IsVerified		bool			`gorm:"default:false" json:"is_verified"`
	CreatedAt		time.Time		`json:"created_at"`
}

type AdminLogin struct {
	Email			string			`json:"email" binding:"required"`
	Password		string			`json:"password" binding:"required"`
}
