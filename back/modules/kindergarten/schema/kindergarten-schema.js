// ===============================
// СХЕМИ ДЛЯ ГРУП САДОЧКА
// ===============================

const kindergartenGroupFilterSchema = {
    body: {
        page: {
            type: 'number',
            optional: true,
        },
        limit: {
            type: 'number',
            optional: true,
        },
        sort_by: {
            type: 'string',
            optional: true,
        },
        sort_direction: {
            type: 'string',
            optional: true,
        },
        kindergarten_name: {
            type: 'string',
            optional: true,
            min: 1,
        },
        group_name: {
            type: 'string',
            optional: true,
            min: 1,
        },
        group_type: {
            type: 'string',
            optional: true,
            enum: ['young', 'middle', 'senior', 'preparatory'],
        },
    }
};

const kindergartenGroupCreateSchema = {
    body: {
        kindergarten_name: {
            type: 'string',
            min: 1,
            max: 100,
        },
        group_name: {
            type: 'string',
            min: 1,
            max: 100,
        },
        group_type: {
            type: 'string',
            enum: ['young', 'middle', 'senior', 'preparatory'],
        },
    }
};

const kindergartenGroupUpdateSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        }
    },
    body: {
        kindergarten_name: {
            type: 'string',
            min: 1,
            max: 100,
            optional: true,
        },
        group_name: {
            type: 'string',
            min: 1,
            max: 100,
            optional: true,
        },
        group_type: {
            type: 'string',
            enum: ['young', 'middle', 'senior', 'preparatory'],
            optional: true,
        },
    }
};

const kindergartenGroupDeleteSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        }
    }
};

const kindergartenGroupInfoSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        }
    }
};

// ===============================
// СХЕМИ ДЛЯ ДІТЕЙ САДОЧКА
// ===============================

const childrenInfoSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true
        }
    }
};

const childrenFilterSchema = {
    body: {
        page: {
            type: 'number',
            optional: true,
        },
        limit: {
            type: 'number',
            optional: true,
        },
        sort_by: {
            type: 'string',
            optional: true,
            enum: ['id', 'child_name', 'parent_name', 'created_at']
        },
        sort_direction: {
            type: 'string',
            optional: true,
            enum: ['asc', 'desc']
        },
        child_name: {
            type: 'string',
            optional: true,
            min: 1
        },
        parent_name: {
            type: 'string',
            optional: true,
            min: 1
        },
        phone_number: {
            type: 'string',
            optional: true,
            min: 1
        },
        group_id: {
            type: 'number',
            optional: true
        }
    }
};

const childrenCreateSchema = {
    body: {
        child_name: {
            type: 'string',
            min: 1,
            max: 100,
            trim: true
        },
        parent_name: {
            type: 'string',
            min: 1,
            max: 100,
            trim: true
        },
        phone_number: {
            type: 'string',
            min: 10,
            max: 20,
            optional: true
        },
        group_id: {
            type: 'number',
            positive: true
        }
    }
};

const childrenUpdateSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true
        }
    },
    body: {
        child_name: {
            type: 'string',
            min: 1,
            max: 100,
            trim: true,
            optional: true
        },
        parent_name: {
            type: 'string',
            min: 1,
            max: 100,
            trim: true,
            optional: true
        },
        phone_number: {
            type: 'string',
            min: 10,
            max: 20,
            optional: true
        },
        group_id: {
            type: 'number',
            positive: true,
            optional: true
        }
    }
};

const childrenDeleteSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true
        }
    }
};

// ===============================
// СХЕМИ ДЛЯ ВІДВІДУВАНОСТІ
// ===============================

const attendanceInfoSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        },
    }
};

const attendanceFilterSchema = {
    body: {
        page: {
            type: 'number',
            optional: true,
        },
        limit: {
            type: 'number', 
            optional: true,
        },
        sort_by: {
            type: 'string',
            optional: true,
        },
        sort_direction: {
            type: 'string',
            optional: true,
        },
        child_name: {
            type: 'string',
            optional: true,
            min: 1,
        },
        group_name: {
            type: 'string',
            optional: true,
            min: 1,
        },
        kindergarten_name: {
            type: 'string',
            optional: true,
            min: 1,
        },
        date: {
            type: 'string',
            optional: true,
            format: 'date',
        },
        date_from: {
            type: 'string',
            optional: true,
            format: 'date',
        },
        date_to: {
            type: 'string',
            optional: true,
            format: 'date',
        },
        attendance_status: {
            type: 'string',
            optional: true,
            enum: ['present', 'absent', 'sick', 'vacation'],
        },
        child_id: {
            type: 'number',
            optional: true,
        },
    }
};

const attendanceCreateSchema = {
    body: {
        date: {
            type: 'string',
            format: 'date',
        },
        child_id: {
            type: 'number',
            minimum: 1,
        },
        attendance_status: {
            type: 'string',
            enum: ['present', 'absent', 'sick', 'vacation'],
        },
        notes: {
            type: 'string',
            optional: true,
            max: 500,
        },
    }
};

const attendanceUpdateSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        },
    },
    body: {
        date: {
            type: 'string',
            format: 'date',
            optional: true,
        },
        child_id: {
            type: 'number',
            minimum: 1,
            optional: true,
        },
        attendance_status: {
            type: 'string',
            enum: ['present', 'absent', 'sick', 'vacation'],
            optional: true,
        },
        notes: {
            type: 'string',
            optional: true,
            max: 500,
        },
    }
};

const attendanceDeleteSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        }
    }
};

const attendanceByDateSchema = {
    params: {
        date: {
            type: 'string',
        }
    }
};

const saveMobileAttendanceSchema = {
    body: {
        date: {
            type: 'number',
            positive: true,
        },
        children: {
            type: 'array',
            items: {
                type: 'number',
                positive: true,
            }
        }
    }
};

// ===============================
// СХЕМИ ДЛЯ ВАРТОСТІ ХАРЧУВАННЯ
// ===============================

const foodCostInfoSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        },
    }
};

const foodCostFilterSchema = {
    body: {
        page: {
            type: 'number',
            optional: true,
        },
        limit: {
            type: 'number',
            optional: true,
        },
        sort_by: {
            type: 'string',
            optional: true,
        },
        sort_direction: {
            type: 'string',
            optional: true,
        },
        date: {
            type: 'string',
            optional: true,
            format: 'date',
        },
        date_from: {
            type: 'string',
            optional: true,
            format: 'date',
        },
        date_to: {
            type: 'string',
            optional: true,
            format: 'date',
        },
        food_cost_min: {
            type: 'number',
            optional: true,
        },
        food_cost_max: {
            type: 'number',
            optional: true,
        },
    }
};

const foodCostCreateSchema = {
    body: {
        date: {
            type: 'string',
            format: 'date',
        },
        food_cost: {
            type: 'number',
            positive: true,
        },
    }
};

const foodCostUpdateSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        },
    },
    body: {
        date: {
            type: 'string',
            format: 'date',
            optional: true,
        },
        food_cost: {
            type: 'number',
            positive: true,
            optional: true,
        },
    }
};

const foodCostDeleteSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        }
    }
};

// ===============================
// СХЕМИ ДЛЯ БАТЬКІВСЬКОЇ ПЛАТИ
// ===============================

const billingInfoSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        },
    }
};

const billingFilterSchema = {
    body: {
        page: {
            type: 'number',
            optional: true,
        },
        limit: {
            type: 'number',
            optional: true,
        },
        sort_by: {
            type: 'string',
            optional: true,
        },
        sort_direction: {
            type: 'string',
            optional: true,
        },
        payment_month_from: {
            type: 'string',
            optional: true,
        },
        payment_month_to: {
            type: 'string',
            optional: true,
        },
        parent_name: {
            type: 'string',
            optional: true,
            min: 1,
        },
        balance_min: {
            type: 'number',
            optional: true,
        },
        balance_max: {
            type: 'number',
            optional: true,
        },
    }
};

const billingCreateSchema = {
    body: {
        parent_name: {
            type: 'string',
            min: 1,
            max: 100,
        },
        payment_month: {
            type: 'string',
        },
        current_debt: {
            type: 'number',
            optional: true,
        },
        current_accrual: {
            type: 'number',
            optional: true,
        },
        current_payment: {
            type: 'number',
            optional: true,
        },
        notes: {
            type: 'string',
            optional: true,
            max: 500,
        },
    }
};

const billingUpdateSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        },
    },
    body: {
        parent_name: {
            type: 'string',
            min: 1,
            max: 100,
            optional: true,
        },
        payment_month: {
            type: 'string',
            optional: true,
        },
        current_debt: {
            type: 'number',
            optional: true,
        },
        current_accrual: {
            type: 'number',
            optional: true,
        },
        current_payment: {
            type: 'number',
            optional: true,
        },
        notes: {
            type: 'string',
            optional: true,
            max: 500,
        },
    }
};

const billingDeleteSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        }
    }
};

// ===============================
// СХЕМИ ДЛЯ АДМІНІСТРАТОРІВ
// ===============================

const adminsFilterSchema = {
    body: {
        page: {
            type: 'number',
            optional: true,
        },
        limit: {
            type: 'number',
            optional: true,
        },
        sort_by: {
            type: 'string',
            optional: true,
        },
        sort_direction: {
            type: 'string',
            optional: true,
        },
        phone_number: {
            type: 'string',
            pattern: '^\\+?[0-9\\s\\-\\(\\)]{10,20}$',
            optional: true,
        },
        full_name: {
            type: 'string',
            min: 1,
            max: 100,
            optional: true,
        },
        kindergarten_name: {
            type: 'string',
            min: 1,
            max: 100,
            optional: true,
        },
        role: {
            type: 'string',
            enum: ['educator', 'admin'],
            optional: true,
        },
    }
};

const adminsCreateSchema = {
    body: {
        phone_number: {
            type: 'string',
            pattern: '^\\+?[0-9\\s\\-\\(\\)]{10,20}$',
        },
        full_name: {
            type: 'string',
            min: 1,
            max: 100,
        },
        kindergarten_name: {
            type: 'string',
            min: 1,
            max: 100,
        },
        role: {
            type: 'string',
            enum: ['educator', 'admin'],
            optional: true,
        },
    }
};

const adminsUpdateSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        }
    },
    body: {
        phone_number: {
            type: 'string',
            pattern: '^\\+?[0-9\\s\\-\\(\\)]{10,20}$',
            optional: true,
        },
        full_name: {
            type: 'string',
            min: 1,
            max: 100,
            optional: true,
        },
        kindergarten_name: {
            type: 'string',
            min: 1,
            max: 100,
            optional: true,
        },
        role: {
            type: 'string',
            enum: ['educator', 'admin'],
            optional: true,
        },
    }
};

const adminsDeleteSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        }
    }
};

const adminsInfoSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        }
    }
};

const verifyEducatorSchema = {
    body: {
        phone_number: {
            type: 'string',
            pattern: '^\\+?[0-9\\s\\-\\(\\)]{10,20}$',
        }
    }
};

module.exports = {
    // Групи
    kindergartenGroupFilterSchema,
    kindergartenGroupCreateSchema,
    kindergartenGroupUpdateSchema,
    kindergartenGroupDeleteSchema,
    kindergartenGroupInfoSchema,
    
    // Діти
    childrenFilterSchema,
    childrenCreateSchema,
    childrenUpdateSchema,
    childrenDeleteSchema,
    childrenInfoSchema,
    
    // Відвідуваність
    attendanceFilterSchema,
    attendanceCreateSchema,
    attendanceUpdateSchema,
    attendanceDeleteSchema,
    attendanceInfoSchema,
    attendanceByDateSchema,
    saveMobileAttendanceSchema,
    
    // Вартість харчування
    foodCostFilterSchema,
    foodCostCreateSchema,
    foodCostUpdateSchema,
    foodCostDeleteSchema,
    foodCostInfoSchema,
    
    // Батьківська плата
    billingFilterSchema,
    billingCreateSchema,
    billingUpdateSchema,
    billingDeleteSchema,
    billingInfoSchema,
    
    // Адміністратори
    adminsFilterSchema,
    adminsCreateSchema,
    adminsUpdateSchema,
    adminsDeleteSchema,
    adminsInfoSchema,
    verifyEducatorSchema,
};