const { sqlRequest } = require("../../../helpers/database");
const { buildWhereCondition } = require("../../../utils/function");

class KindergartenRepository {

    async findDebtorById(id) {
        const sql = `
            select
                o.id,
                json_agg(
                    json_build_object(
                        'id', od.id,
                        'child_name', od.child_name,
                        'debt_amount', od.debt_amount,
                        'group_number', od.group_number,
                        'kindergarten_name', od.kindergarten_name
                    )
                ) as debts
            from ower.ower o
            left join ower.ower_debt od on o.id = od.ower_id
            where o.id = ?
            group by o.id
        `;
        return await sqlRequest(sql, [id]);
    }

    async findDebtByFilter(limit, offset, whereConditions = {}) {
        const values = [];
        let sql = `
            select json_agg(rw) as data,
                max(cnt) as count
                from (
                select json_build_object(
                    'id', od.id,
                    'child_name', od.child_name,
                    'debt_amount', od.debt_amount,
                    'group_number', od.group_number,
                    'kindergarten_name', od.kindergarten_name
                ) as rw,
                count(*) over () as cnt
            from ower.ower_debt od
            where 1=1
        `;

        if (Object.keys(whereConditions).length) {
            const data = buildWhereCondition(whereConditions, 'od');
            sql += data.text;
            values.push(...data.value);
        }

        values.push(limit);
        values.push(offset);
        sql += ` order by od.id desc limit ? offset ? ) q`;

        return await sqlRequest(sql, values);
    }

    async generateWordByDebtId(request, reply) {
        // Логіка генерації Word документа
        // Повертає файл
        return null;
    }

    async printDebtId(request, reply) {
        // Логіка друку
        // Повертає PDF або інший формат
        return null;
    }

    // ===============================
    // МЕТОДИ ДЛЯ ГРУП САДОЧКА
    // ===============================

    async findGroupsByFilter(options) {
        const {
            limit,
            offset,
            sort_by = 'id',
            sort_direction = 'desc',
            kindergarten_name,
            group_name,
            group_type
        } = options;

        const values = [];
        let sql = `
            select json_agg(rw) as data,
                max(cnt) as count
                from (
                select json_build_object(
                    'id', kg.id,
                    'kindergarten_name', kg.kindergarten_name,
                    'group_name', kg.group_name,
                    'group_type', kg.group_type,
                    'created_at', kg.created_at
                ) as rw,
                count(*) over () as cnt
            from ower.kindergarten_groups kg
            where 1=1
        `;

        // Додаємо фільтри
        if (kindergarten_name) {
            sql += ` AND kg.kindergarten_name ILIKE ?`;
            values.push(`%${kindergarten_name}%`);
        }

        if (group_name) {
            sql += ` AND kg.group_name ILIKE ?`;
            values.push(`%${group_name}%`);
        }

        if (group_type) {
            sql += ` AND kg.group_type = ?`;
            values.push(group_type);
        }

        // Додаємо сортування
        const allowedSortFields = ['id', 'kindergarten_name', 'group_name', 'group_type', 'created_at'];
        const validSortBy = allowedSortFields.includes(sort_by) ? sort_by : 'id';
        const validSortDirection = ['asc', 'desc'].includes(sort_direction.toLowerCase()) ? sort_direction.toUpperCase() : 'DESC';
        
        sql += ` ORDER BY kg.${validSortBy} ${validSortDirection}`;
        
        // Додаємо пагінацію
        sql += ` LIMIT ? OFFSET ?`;
        values.push(limit, offset);
        
        sql += `) q`;

        return await sqlRequest(sql, values);
    }

    async getGroupByNameAndKindergarten(groupName, kindergartenName, excludeId = null) {
        let sql = `
            SELECT id, kindergarten_name, group_name 
            FROM ower.kindergarten_groups 
            WHERE group_name = ? AND kindergarten_name = ?
        `;
        const values = [groupName, kindergartenName];

        if (excludeId) {
            sql += ` AND id != ?`;
            values.push(excludeId);
        }

        return await sqlRequest(sql, values);
    }

    async createGroup(groupData) {
        const {
            kindergarten_name,
            group_name,
            group_type,
            created_at
        } = groupData;

        const sql = `
            INSERT INTO ower.kindergarten_groups 
            (kindergarten_name, group_name, group_type, created_at)
            VALUES (?, ?, ?, ?)
            RETURNING id, kindergarten_name, group_name, group_type, created_at
        `;

        const values = [
            kindergarten_name,
            group_name,
            group_type,
            created_at
        ];

        return await sqlRequest(sql, values);
    }

    async getGroupById(id) {
        const sql = `
            SELECT id, kindergarten_name, group_name, group_type, created_at 
            FROM ower.kindergarten_groups 
            WHERE id = ?
        `;
        return await sqlRequest(sql, [id]);
    }

    async updateGroup(id, groupData) {
        const fields = Object.keys(groupData).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(groupData), id];
        
        const sql = `
            UPDATE ower.kindergarten_groups 
            SET ${fields}
            WHERE id = ?
            RETURNING id, kindergarten_name, group_name, group_type, created_at
        `;
        
        return await sqlRequest(sql, values);
    }

    async deleteGroup(id) {
        const sql = `
            DELETE FROM ower.kindergarten_groups 
            WHERE id = ?
            RETURNING id
        `;
        
        return await sqlRequest(sql, [id]);
    }

    // ===============================
    // МЕТОДИ ДЛЯ ДІТЕЙ САДОЧКА
    // ===============================

    async findChildrenByFilter(options) {
        const {
            limit,
            offset,
            sort_by = 'id',
            sort_direction = 'desc',
            child_name,
            parent_name,
            phone_number,
            group_id
        } = options;

        const values = [];
        let sql = `
            select json_agg(rw) as data,
                max(cnt) as count
                from (
                select json_build_object(
                    'id', cr.id,
                    'child_name', cr.child_name,
                    'parent_name', cr.parent_name,
                    'phone_number', cr.phone_number,
                    'group_id', cr.group_id,
                    'created_at', cr.created_at,
                    'group_name', kg.group_name,
                    'kindergarten_name', kg.kindergarten_name
                ) as rw,
                count(*) over () as cnt
            from ower.children_roster cr
            left join ower.kindergarten_groups kg on kg.id = cr.group_id
            where 1=1
        `;

        // Додаємо фільтри
        if (child_name) {
            sql += ` AND cr.child_name ILIKE ?`;
            values.push(`%${child_name}%`);
        }

        if (parent_name) {
            sql += ` AND cr.parent_name ILIKE ?`;
            values.push(`%${parent_name}%`);
        }

        if (phone_number) {
            sql += ` AND cr.phone_number ILIKE ?`;
            values.push(`%${phone_number}%`);
        }

        if (group_id) {
            sql += ` AND cr.group_id = ?`;
            values.push(group_id);
        }

        // Додаємо сортування
        const allowedSortFields = ['id', 'child_name', 'parent_name', 'phone_number', 'created_at'];
        const validSortBy = allowedSortFields.includes(sort_by) ? sort_by : 'id';
        const validSortDirection = ['asc', 'desc'].includes(sort_direction.toLowerCase()) ? sort_direction.toUpperCase() : 'DESC';
        
        // Для сортування по групі використовуємо назву групи
        if (validSortBy === 'group_id') {
            sql += ` ORDER BY kg.group_name ${validSortDirection}`;
        } else {
            sql += ` ORDER BY cr.${validSortBy} ${validSortDirection}`;
        }
        
        // Додаємо пагінацію
        sql += ` LIMIT ? OFFSET ?`;
        values.push(limit, offset);
        
        sql += `) q`;

        return await sqlRequest(sql, values);
    }

    async getChildById(id) {
        const sql = `
            SELECT 
                cr.id, 
                cr.child_name, 
                cr.parent_name, 
                cr.phone_number, 
                cr.group_id,
                cr.created_at,
                kg.group_name,
                kg.kindergarten_name
            FROM ower.children_roster cr
            LEFT JOIN ower.kindergarten_groups kg ON kg.id = cr.group_id
            WHERE cr.id = ?
        `;
        return await sqlRequest(sql, [id]);
    }

    async getChildByNameAndGroup(childName, groupId, excludeId = null) {
        let sql = `
            SELECT id, child_name, group_id 
            FROM ower.children_roster 
            WHERE child_name = ? AND group_id = ?
        `;
        const values = [childName, groupId];

        if (excludeId) {
            sql += ` AND id != ?`;
            values.push(excludeId);
        }

        return await sqlRequest(sql, values);
    }

    async createChild(childData) {
        const {
            child_name,
            parent_name,
            phone_number,
            group_id,
            created_at
        } = childData;

        const sql = `
            INSERT INTO ower.children_roster 
            (child_name, parent_name, phone_number, group_id, created_at)
            VALUES (?, ?, ?, ?, ?)
            RETURNING id, child_name, parent_name, phone_number, group_id, created_at
        `;

        const values = [
            child_name,
            parent_name,
            phone_number,
            group_id,
            created_at
        ];

        return await sqlRequest(sql, values);
    }

    async updateChild(id, childData) {
        const fields = Object.keys(childData).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(childData), id];
        
        const sql = `
            UPDATE ower.children_roster 
            SET ${fields}
            WHERE id = ?
            RETURNING id, child_name, parent_name, phone_number, group_id, created_at
        `;
        
        return await sqlRequest(sql, values);
    }

    async deleteChild(id) {
        const sql = `
            DELETE FROM ower.children_roster 
            WHERE id = ?
            RETURNING id
        `;
        
        return await sqlRequest(sql, [id]);
    }

    // ===============================
    // МЕТОДИ ДЛЯ ВІДВІДУВАНОСТІ
    // ===============================

    async findAttendanceByFilter(options) {
        const {
            limit,
            offset,
            sort_by = 'date',
            sort_direction = 'desc',
            child_name,
            group_name,
            date_from,
            date_to,
            attendance_status,
            child_id
        } = options;

        const values = [];
        let sql = `
            select json_agg(rw) as data,
                max(cnt) as count
                from (
                select json_build_object(
                    'id', a.id,
                    'date', a.date,
                    'child_id', a.child_id,
                    'attendance_status', a.attendance_status,
                    'notes', a.notes,
                    'created_at', a.created_at,
                    'child_name', cr.child_name,
                    'parent_name', cr.parent_name,
                    'group_name', kg.group_name,
                    'kindergarten_name', kg.kindergarten_name
                ) as rw,
                count(*) over () as cnt
            from ower.attendance a
            left join ower.children_roster cr on cr.id = a.child_id
            left join ower.kindergarten_groups kg on kg.id = cr.group_id
            where 1=1
        `;

        // Додаємо фільтри
        if (child_name) {
            sql += ` AND cr.child_name ILIKE ?`;
            values.push(`%${child_name}%`);
        }

        if (group_name) {
            sql += ` AND kg.group_name ILIKE ?`;
            values.push(`%${group_name}%`);
        }

        if (date_from) {
            sql += ` AND a.date >= ?`;
            values.push(date_from);
        }

        if (date_to) {
            sql += ` AND a.date <= ?`;
            values.push(date_to);
        }

        if (attendance_status) {
            sql += ` AND a.attendance_status = ?`;
            values.push(attendance_status);
        }

        if (child_id) {
            sql += ` AND a.child_id = ?`;
            values.push(child_id);
        }

        // Додаємо сортування
        const allowedSortFields = ['id', 'date', 'attendance_status', 'created_at'];
        const validSortBy = allowedSortFields.includes(sort_by) ? sort_by : 'date';
        const validSortDirection = ['asc', 'desc'].includes(sort_direction.toLowerCase()) ? sort_direction.toUpperCase() : 'DESC';
        
        // Для сортування по імені дитини або групі використовуємо відповідні поля
        if (validSortBy === 'child_name') {
            sql += ` ORDER BY cr.child_name ${validSortDirection}`;
        } else if (validSortBy === 'group_name') {
            sql += ` ORDER BY kg.group_name ${validSortDirection}`;
        } else {
            sql += ` ORDER BY a.${validSortBy} ${validSortDirection}`;
        }
        
        // Додаємо пагінацію
        sql += ` LIMIT ? OFFSET ?`;
        values.push(limit, offset);
        
        sql += `) q`;

        return await sqlRequest(sql, values);
    }

    async getAttendanceById(id) {
        const sql = `
            SELECT 
                a.id, 
                a.date, 
                a.child_id,
                a.attendance_status,
                a.notes,
                a.created_at,
                cr.child_name,
                cr.parent_name,
                kg.group_name,
                kg.kindergarten_name
            FROM ower.attendance a
            LEFT JOIN ower.children_roster cr ON cr.id = a.child_id
            LEFT JOIN ower.kindergarten_groups kg ON kg.id = cr.group_id
            WHERE a.id = ?
        `;
        return await sqlRequest(sql, [id]);
    }

    async getAttendanceByDateAndChild(date, childId, excludeId = null) {
        let sql = `
            SELECT id, date, child_id, attendance_status 
            FROM ower.attendance 
            WHERE date = ? AND child_id = ?
        `;
        const values = [date, childId];

        if (excludeId) {
            sql += ` AND id != ?`;
            values.push(excludeId);
        }

        return await sqlRequest(sql, values);
    }

    async createAttendance(attendanceData) {
        const {
            date,
            child_id,
            attendance_status,
            notes,
            created_at
        } = attendanceData;

        const sql = `
            INSERT INTO ower.attendance 
            (date, child_id, attendance_status, notes, created_at)
            VALUES (?, ?, ?, ?, ?)
            RETURNING id, date, child_id, attendance_status, notes, created_at
        `;

        const values = [
            date,
            child_id,
            attendance_status,
            notes,
            created_at
        ];

        return await sqlRequest(sql, values);
    }

    async updateAttendance(id, attendanceData) {
        const fields = Object.keys(attendanceData).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(attendanceData), id];
        
        const sql = `
            UPDATE ower.attendance 
            SET ${fields}
            WHERE id = ?
            RETURNING id, date, child_id, attendance_status, notes, created_at
        `;
        
        return await sqlRequest(sql, values);
    }

    async deleteAttendance(id) {
        const sql = `
            DELETE FROM ower.attendance 
            WHERE id = ?
            RETURNING id
        `;
        
        return await sqlRequest(sql, [id]);
    }

    async getAttendanceByChildId(childId) {
        const sql = `
            SELECT 
                a.id, 
                a.date, 
                a.child_id,
                a.attendance_status,
                a.notes,
                a.created_at
            FROM ower.attendance a
            WHERE a.child_id = ?
            ORDER BY a.date DESC
        `;
        return await sqlRequest(sql, [childId]);
    }

    async getAttendanceStatsByChild(childId, dateFrom = null, dateTo = null) {
        let sql = `
            SELECT 
                attendance_status,
                COUNT(*) as count
            FROM ower.attendance 
            WHERE child_id = ?
        `;
        const values = [childId];

        if (dateFrom) {
            sql += ` AND date >= ?`;
            values.push(dateFrom);
        }

        if (dateTo) {
            sql += ` AND date <= ?`;
            values.push(dateTo);
        }

        sql += ` GROUP BY attendance_status`;

        return await sqlRequest(sql, values);
    }

    // ===============================
    // МЕТОДИ ДЛЯ ВАРТОСТІ ХАРЧУВАННЯ
    // ===============================

    async findDailyFoodCostByFilter(options) {
        const {
            limit,
            offset,
            sort_by = 'date',
            sort_direction = 'desc',
            date_from,
            date_to
        } = options;

        const values = [];
        let sql = `
            select json_agg(rw) as data,
                max(cnt) as count
                from (
                select json_build_object(
                    'id', dfc.id,
                    'date', dfc.date,
                    'young_group_cost', dfc.young_group_cost,
                    'older_group_cost', dfc.older_group_cost,
                    'created_at', dfc.created_at
                ) as rw,
                count(*) over () as cnt
            from ower.daily_food_cost dfc
            where 1=1
        `;

        // Додаємо фільтри
        if (date_from) {
            sql += ` AND dfc.date >= ?`;
            values.push(date_from);
        }

        if (date_to) {
            sql += ` AND dfc.date <= ?`;
            values.push(date_to);
        }

        // Додаємо сортування
        const allowedSortFields = ['id', 'date', 'young_group_cost', 'older_group_cost', 'created_at'];
        const validSortBy = allowedSortFields.includes(sort_by) ? sort_by : 'date';
        const validSortDirection = ['asc', 'desc'].includes(sort_direction.toLowerCase()) ? sort_direction.toUpperCase() : 'DESC';
        
        sql += ` ORDER BY dfc.${validSortBy} ${validSortDirection}`;
        
        // Додаємо пагінацію
        sql += ` LIMIT ? OFFSET ?`;
        values.push(limit, offset);
        
        sql += `) q`;

        return await sqlRequest(sql, values);
    }

    async getDailyFoodCostByDateAndExcludeId(date, excludeId = null) {
        let sql = `
            SELECT id, date, young_group_cost, older_group_cost 
            FROM ower.daily_food_cost 
            WHERE date = ?
        `;
        const values = [date];

        if (excludeId) {
            sql += ` AND id != ?`;
            values.push(excludeId);
        }

        return await sqlRequest(sql, values);
    }

    async createDailyFoodCost(data) {
        const {
            date,
            young_group_cost,
            older_group_cost,
            created_at
        } = data;

        const sql = `
            INSERT INTO ower.daily_food_cost 
            (date, young_group_cost, older_group_cost, created_at)
            VALUES (?, ?, ?, ?)
            RETURNING id, date, young_group_cost, older_group_cost, created_at
        `;

        const values = [
            date,
            young_group_cost,
            older_group_cost,
            created_at
        ];

        return await sqlRequest(sql, values);
    }

    async getDailyFoodCostById(id) {
        const sql = `
            SELECT id, date, young_group_cost, older_group_cost, created_at 
            FROM ower.daily_food_cost 
            WHERE id = ?
        `;
        return await sqlRequest(sql, [id]);
    }

    async updateDailyFoodCost(id, data) {
        const fields = Object.keys(data).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(data), id];
        
        const sql = `
            UPDATE ower.daily_food_cost 
            SET ${fields}
            WHERE id = ?
            RETURNING id, date, young_group_cost, older_group_cost, created_at
        `;
        
        return await sqlRequest(sql, values);
    }

    async deleteDailyFoodCost(id) {
        const sql = `
            DELETE FROM ower.daily_food_cost 
            WHERE id = ?
            RETURNING id
        `;
        
        return await sqlRequest(sql, [id]);
    }

    // ===============================
    // МЕТОДИ ДЛЯ БАТЬКІВСЬКОЇ ПЛАТИ
    // ===============================

    async findBillingByFilter(options) {
        const {
            limit,
            offset,
            sort_by = 'payment_month',
            sort_direction = 'desc',
            payment_month_from,
            payment_month_to,
            parent_name,
            balance_min,
            balance_max
        } = options;

        const values = [];
        let sql = `
            select json_agg(rw) as data,
                max(cnt) as count
                from (
                select json_build_object(
                    'id', kb.id,
                    'parent_name', kb.parent_name,
                    'payment_month', kb.payment_month,
                    'current_debt', kb.current_debt,
                    'current_accrual', kb.current_accrual,
                    'current_payment', kb.current_payment,
                    'balance', kb.balance,
                    'notes', kb.notes,
                    'created_at', kb.created_at,
                    'updated_at', kb.updated_at
                ) as rw,
                count(*) over () as cnt
            from ower.kindergarten_billing kb
            where 1=1
        `;

        // Додаємо фільтри
        if (payment_month_from) {
            sql += ` AND kb.payment_month >= ?`;
            values.push(payment_month_from);
        }

        if (payment_month_to) {
            sql += ` AND kb.payment_month <= ?`;
            values.push(payment_month_to);
        }

        if (parent_name) {
            sql += ` AND kb.parent_name ILIKE ?`;
            values.push(`%${parent_name}%`);
        }

        if (balance_min !== undefined && balance_min !== null) {
            sql += ` AND kb.balance >= ?`;
            values.push(balance_min);
        }

        if (balance_max !== undefined && balance_max !== null) {
            sql += ` AND kb.balance <= ?`;
            values.push(balance_max);
        }

        // Додаємо сортування
        const allowedSortFields = ['id', 'parent_name', 'payment_month', 'current_debt', 'current_accrual', 'current_payment', 'balance', 'created_at'];
        const validSortBy = allowedSortFields.includes(sort_by) ? sort_by : 'payment_month';
        const validSortDirection = ['asc', 'desc'].includes(sort_direction.toLowerCase()) ? sort_direction.toLowerCase() : 'desc';

        sql += ` order by kb.${validSortBy} ${validSortDirection}`;

        // Додаємо ліміт та офсет
        sql += ` limit ? offset ? ) q`;
        values.push(limit, offset);

        return await sqlRequest(sql, values);
    }

    async getBillingById(id) {
        const sql = `
            SELECT 
                id, 
                parent_name, 
                payment_month,
                current_debt,
                current_accrual,
                current_payment,
                balance,
                notes,
                created_at,
                updated_at
            FROM ower.kindergarten_billing 
            WHERE id = ?
        `;
        return await sqlRequest(sql, [id]);
    }

    async getBillingByParentAndMonth(parent_name, payment_month) {
        const sql = `
            SELECT id, parent_name, payment_month
            FROM ower.kindergarten_billing 
            WHERE parent_name = ? AND payment_month = ?
        `;
        return await sqlRequest(sql, [parent_name, payment_month]);
    }

    async getBillingByParentAndMonthExcludeId(parent_name, payment_month, excludeId) {
        const sql = `
            SELECT id, parent_name, payment_month
            FROM ower.kindergarten_billing 
            WHERE parent_name = ? AND payment_month = ? AND id != ?
        `;
        return await sqlRequest(sql, [parent_name, payment_month, excludeId]);
    }

    async createBilling(billingData) {
        const {
            parent_name,
            payment_month,
            current_debt,
            current_accrual,
            current_payment,
            notes,
            created_at
        } = billingData;

        const values = [
            parent_name,
            payment_month,
            current_debt || 0,
            current_accrual || 0,
            current_payment || 0,
            notes || null
        ];

        const sql = `
            INSERT INTO ower.kindergarten_billing 
            (parent_name, payment_month, current_debt, current_accrual, current_payment, notes) 
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING id, parent_name, payment_month, current_debt, current_accrual, current_payment, balance, notes, created_at
        `;
        
        return await sqlRequest(sql, values);
    }

    async updateBilling(id, updateData) {
        const allowedFields = [
            'parent_name', 
            'payment_month', 
            'current_debt', 
            'current_accrual', 
            'current_payment', 
            'notes'
        ];
        
        const updateFields = [];
        const values = [];
        
        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key) && updateData[key] !== undefined) {
                updateFields.push(`${key} = ?`);
                values.push(updateData[key]);
            }
        });
        
        if (updateFields.length === 0) {
            throw new Error('Немає полів для оновлення');
        }
        
        values.push(id);
        
        const sql = `
            UPDATE ower.kindergarten_billing 
            SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            RETURNING id, parent_name, payment_month, current_debt, current_accrual, current_payment, balance, notes, updated_at
        `;
        
        return await sqlRequest(sql, values);
    }

    async deleteBilling(id) {
        const sql = `
            DELETE FROM ower.kindergarten_billing 
            WHERE id = ?
            RETURNING id
        `;
        
        return await sqlRequest(sql, [id]);
    }

    async getBillingStatsByParent(parentName, dateFrom = null, dateTo = null) {
        let sql = `
            SELECT 
                COUNT(*) as total_records,
                SUM(current_debt) as total_debt,
                SUM(current_accrual) as total_accrual,
                SUM(current_payment) as total_payment,
                SUM(balance) as total_balance,
                AVG(balance) as avg_balance
            FROM ower.kindergarten_billing 
            WHERE parent_name = ?
        `;
        const values = [parentName];

        if (dateFrom) {
            sql += ` AND payment_month >= ?`;
            values.push(dateFrom);
        }

        if (dateTo) {
            sql += ` AND payment_month <= ?`;
            values.push(dateTo);
        }

        return await sqlRequest(sql, values);
    }

    async getBillingMonthlyStats(year = null) {
        let sql = `
            SELECT 
                DATE_TRUNC('month', payment_month) as month,
                COUNT(*) as records_count,
                SUM(current_debt) as total_debt,
                SUM(current_accrual) as total_accrual,
                SUM(current_payment) as total_payment,
                SUM(balance) as total_balance
            FROM ower.kindergarten_billing
        `;
        
        const values = [];
        
        if (year) {
            sql += ` WHERE EXTRACT(YEAR FROM payment_month) = ?`;
            values.push(year);
        }
        
        sql += `
            GROUP BY DATE_TRUNC('month', payment_month)
            ORDER BY month DESC
        `;

        return await sqlRequest(sql, values);
    }
}

module.exports = new KindergartenRepository();