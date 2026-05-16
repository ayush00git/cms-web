package models

import (
	"time"
)

type AdminPost string
const (
	TypeXENCivil 		AdminPost = "XEN_Civil"
	TypeAECivil 		AdminPost = "AE_Civil"
	TypeJECivil 		AdminPost = "JE_Civil"
	TypeXENElectrical 	AdminPost = "XEN_Electrical"
	TypeAEElectrical 	AdminPost = "AE_Electrical"
	TypeJEElectrical 	AdminPost = "JE_Electrical"
)

type Admin struct {
	ID				uint			`gorm:"primaryKey;autoIncrement" json:"id"`
	Email			string			`gorm:"uniqueIndex;not null" json:"email"`
	Password		string			`gorm:"not null" json:"password"`
	Post			AdminPost		`gorm:"type:varchar(15);unique;not null" json:"post"`
	IsVerified		bool			`gorm:"default:false" json:"is_verified"`
	CreatedAt		time.Time		`json:"created_at"`
}

type AdminLogin struct {
	Email			string			`json:"email" binding:"required"`
	Password		string			`json:"password" binding:"required"`
}
