// Основні схеми для садочків
const kindergartenFilterSchema = {
    body: {
        page: {
            type: 'number',
            optional: true,
        },
        limit: {
            type: 'number',
            optional: true,
        },
    }
};

const kindergartenInfoSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        },
    }
};

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
            enum: ['id', 'child_name', 'parent_name', 'kindergarten_name', 'created_at']
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
        kindergarten_name: {
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
        kindergarten_name: {
            type: 'string',
            min: 1,
            max: 100,
            trim: true
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
        kindergarten_name: {
            type: 'string',
            min: 1,
            max: 100,
            trim: true,
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
        }
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

// ===============================
// СХЕМИ ДЛЯ ВАРТОСТІ ХАРЧУВАННЯ
// ===============================

const dailyFoodCostFilterSchema = {
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
    }
};

const dailyFoodCostCreateSchema = {
    body: {
        date: {
            type: 'string',
            format: 'date',
        },
        young_group_cost: {
            type: 'number',
            minimum: 0,
            maximum: 9999.99,
        },
        older_group_cost: {
            type: 'number',
            minimum: 0,
            maximum: 9999.99,
        },
        notes: {
            type: 'string',
            optional: true,
            max: 500,
        },
    }
};

const dailyFoodCostUpdateSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        }
    },
    body: {
        date: {
            type: 'string',
            format: 'date',
            optional: true,
        },
        young_group_cost: {
            type: 'number',
            minimum: 0,
            maximum: 9999.99,
            optional: true,
        },
        older_group_cost: {
            type: 'number',
            minimum: 0,
            maximum: 9999.99,
            optional: true,
        },
        notes: {
            type: 'string',
            optional: true,
            max: 500,
        },
    }
};

const dailyFoodCostDeleteSchema = {
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
        parent_name: {
            type: 'string',
            optional: true,
            min: 1,
        },
        payment_month_from: {
            type: 'string',
            optional: true,
            format: 'date',
        },
        payment_month_to: {
            type: 'string',
            optional: true,
            format: 'date',
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
            format: 'date',
        },
        current_debt: {
            type: 'number',
            minimum: 0,
            maximum: 999999.99,
            optional: true,
        },
        current_accrual: {
            type: 'number',
            minimum: 0,
            maximum: 999999.99,
            optional: true,
        },
        current_payment: {
            type: 'number',
            minimum: 0,
            maximum: 999999.99,
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
        }
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
            format: 'date',
            optional: true,
        },
        current_debt: {
            type: 'number',
            minimum: 0,
            maximum: 999999.99,
            optional: true,
        },
        current_accrual: {
            type: 'number',
            minimum: 0,
            maximum: 999999.99,
            optional: true,
        },
        current_payment: {
            type: 'number',
            minimum: 0,
            maximum: 999999.99,
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
// ✅ СХЕМИ ДЛЯ МОБІЛЬНОГО ДОДАТКУ (ВИПРАВЛЕНО)
// ===============================

const mobileAttendanceGetSchema = {
    params: {
        date: {
            type: 'string',
            pattern: '^[0-9]{10}$', // Unix timestamp (10 цифр)
        }
    }
};

// ✅ ВИПРАВЛЕНА СХЕМА - НОВА TOGGLE ЛОГІКА
const mobileAttendanceSaveSchema = {
    body: {
        date: {
            type: 'number',
            minimum: 1000000000, // мінімальний timestamp (10 цифр)
            maximum: 9999999999, // максимальний timestamp (10 цифр)
            description: 'Unix timestamp (секунди)'
        },
        children: {
            type: 'array',
            min: 1, // мінімум 1 дитина
            items: {
                type: 'number',
                minimum: 1,
                description: 'ID дитини'
            },
            description: 'Масив ID дітей на яких натиснули (toggle)'
        }
    }
};

// ===============================
// СХЕМИ ДЛЯ АДМІНІСТРАТОРІВ САДОЧКА
// ===============================

const adminsInfoSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        },
    }
};

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
            optional: true,
            pattern: '^\\+?[0-9\\s\\-\\(\\)]{10,20}$',
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

const verifyEducatorSchema = {
    body: {
        phone_number: {
            type: 'string',
            pattern: '^\\+?[0-9\\s\\-\\(\\)]{10,20}$',
        }
    }
};

module.exports = {
    // Основні схеми садочка
    kindergartenFilterSchema,
    kindergartenInfoSchema,
    
    // Схеми для груп
    kindergartenGroupFilterSchema,
    kindergartenGroupCreateSchema,
    kindergartenGroupUpdateSchema,
    kindergartenGroupDeleteSchema,
    
    // Схеми для дітей
    childrenFilterSchema,
    childrenInfoSchema,
    childrenCreateSchema,
    childrenUpdateSchema,
    childrenDeleteSchema,

    // Схеми для відвідуваності
    attendanceFilterSchema,
    attendanceInfoSchema,
    attendanceCreateSchema,
    attendanceUpdateSchema,
    attendanceDeleteSchema,

    // Схеми для вартості харчування
    dailyFoodCostFilterSchema,
    dailyFoodCostCreateSchema,
    dailyFoodCostUpdateSchema,
    dailyFoodCostDeleteSchema,

    // Схеми для батьківської плати
    billingFilterSchema,
    billingInfoSchema,
    billingCreateSchema,
    billingUpdateSchema,
    billingDeleteSchema,

    // ✅ Схеми для мобільного додатку (ВИПРАВЛЕНО)
    mobileAttendanceGetSchema,
    mobileAttendanceSaveSchema,

    // Схема для перевірки вихователя
    verifyEducatorSchema,

    // Схеми для адміністраторів
    adminsInfoSchema,
    adminsFilterSchema,
    adminsCreateSchema,
    adminsUpdateSchema,
    adminsDeleteSchema,
};