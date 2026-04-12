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
	ID				uint			`gorm:"primaryKey;autoIncrement"`
	Email			string			`gorm:"uniqueIndex;not null"`
	Post			PostType		`gorm:"type:varchar(15);unique;not null"`
	IsVerified		bool			`gorm:"default:false"`
	CreatedAt		time.Time		
}
