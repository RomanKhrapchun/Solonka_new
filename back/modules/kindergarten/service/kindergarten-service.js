const KindergartenRepository = require("../repository/kindergarten-repository");
const { paginate, paginationData } = require("../../../utils/function");
const logRepository = require('../../log/repository/log-repository');

class KindergartenService {

    async getDebtByDebtorId(request) {
        const userData = await KindergartenRepository.findDebtorById(request.params?.id)
        return userData[0];
    }

    async findDebtByFilter(request) {
        const { page = 1, limit = 16, ...whereConditions } = request.body;
        const { offset } = paginate(page, limit);
        const userData = await KindergartenRepository.findDebtByFilter(limit, offset, whereConditions);
        return paginationData(userData[0], page, limit);
    }

    async generateWordByDebtId(request, reply) {
        const userData = await KindergartenRepository.generateWordByDebtId(request, reply)
        return userData;
    }

    async printDebtId(request, reply) {
        const userData = await KindergartenRepository.printDebtId(request, reply)
        return userData;
    }

    // ===============================
    // МЕТОДИ ДЛЯ ГРУП САДОЧКА
    // ===============================

    async findGroupsByFilter(request) {
        const { 
            page = 1, 
            limit = 16, 
            sort_by = 'id', 
            sort_direction = 'desc',
            kindergarten_name,
            group_name,
            group_type,
            ...whereConditions 
        } = request.body;

        const { offset } = paginate(page, limit);
        
        // Логування пошуку якщо є параметри фільтрації
        if (kindergarten_name || group_name || group_type) {
            await logRepository.createLog({
                row_pk_id: null,
                uid: request?.user?.id,
                action: 'SEARCH',
                client_addr: request?.ip,
                application_name: 'Пошук груп садочку',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'ower',
                table_name: 'kindergarten_groups',
                oid: '16505',
            });
        }

        const userData = await KindergartenRepository.findGroupsByFilter({
            limit,
            offset,
            sort_by,
            sort_direction,
            kindergarten_name,
            group_name,
            group_type,
            ...whereConditions
        });

        return paginationData(userData[0], page, limit);
    }

    async createGroup(request) {
        const {
            kindergarten_name,
            group_name,
            group_type
        } = request.body;

        // Перевіряємо чи не існує група з такою назвою в цьому садочку
        const existingGroup = await KindergartenRepository.getGroupByNameAndKindergarten(
            group_name, 
            kindergarten_name
        );

        if (existingGroup && existingGroup.length > 0) {
            throw new Error('Група з такою назвою вже існує в цьому садочку');
        }

        const groupData = {
            kindergarten_name,
            group_name,
            group_type,
            created_at: new Date()
        };

        const result = await KindergartenRepository.createGroup(groupData);

        // Логування створення групи
        await logRepository.createLog({
            row_pk_id: result.insertId || result.id,
            uid: request?.user?.id,
            action: 'INSERT',
            client_addr: request?.ip,
            application_name: 'Створення групи садочку',
            action_stamp_tx: new Date(),
            action_stamp_stm: new Date(),
            action_stamp_clk: new Date(),
            schema_name: 'ower',
            table_name: 'kindergarten_groups',
            oid: '16505',
        });

        return result;
    }

    async updateGroup(request) {
        const { id } = request.params;
        const updateData = request.body;

        // Перевіряємо чи існує група
        const existingGroup = await KindergartenRepository.getGroupById(id);
        if (!existingGroup || existingGroup.length === 0) {
            throw new Error('Групу не знайдено');
        }

        // Якщо змінюється назва групи, перевіряємо на дублікати
        if (updateData.group_name && updateData.kindergarten_name) {
            const duplicateGroup = await KindergartenRepository.getGroupByNameAndKindergarten(
                updateData.group_name, 
                updateData.kindergarten_name,
                id // виключаємо поточну групу
            );

            if (duplicateGroup && duplicateGroup.length > 0) {
                throw new Error('Група з такою назвою вже існує в цьому садочку');
            }
        }

        const result = await KindergartenRepository.updateGroup(id, updateData);

        // Логування оновлення
        await logRepository.createLog({
            row_pk_id: id,
            uid: request?.user?.id,
            action: 'UPDATE',
            client_addr: request?.ip,
            application_name: 'Оновлення групи садочку',
            action_stamp_tx: new Date(),
            action_stamp_stm: new Date(),
            action_stamp_clk: new Date(),
            schema_name: 'ower',
            table_name: 'kindergarten_groups',
            oid: '16505',
        });

        return result;
    }

    async deleteGroup(request) {
        const { id } = request.params;

        // Перевіряємо чи існує група
        const existingGroup = await KindergartenRepository.getGroupById(id);
        if (!existingGroup || existingGroup.length === 0) {
            throw new Error('Групу не знайдено');
        }

        const result = await KindergartenRepository.deleteGroup(id);

        // Логування видалення
        await logRepository.createLog({
            row_pk_id: id,
            uid: request?.user?.id,
            action: 'DELETE',
            client_addr: request?.ip,
            application_name: 'Видалення групи садочку',
            action_stamp_tx: new Date(),
            action_stamp_stm: new Date(),
            action_stamp_clk: new Date(),
            schema_name: 'ower',
            table_name: 'kindergarten_groups',
            oid: '16505',
        });

        return result;
    }

    // ===============================
    // МЕТОДИ ДЛЯ ДІТЕЙ САДОЧКА
    // ===============================

    async findChildrenByFilter(request) {
        const { 
            page = 1, 
            limit = 16, 
            sort_by = 'child_name', 
            sort_direction = 'asc',
            ...whereConditions 
        } = request.body;

        const { offset } = paginate(page, limit);
        
        // Логування пошуку якщо є параметри фільтрації
        if (Object.keys(whereConditions).length > 0) {
            try {
                await logRepository.createLog({
                    row_pk_id: null,
                    uid: request?.user?.id,
                    action: 'SEARCH',
                    client_addr: request?.ip,
                    application_name: 'Пошук дітей садочка',
                    action_stamp_tx: new Date(),
                    action_stamp_stm: new Date(),
                    action_stamp_clk: new Date(),
                    schema_name: 'ower',
                    table_name: 'children_roster',
                    oid: '16506',
                });
            } catch (logError) {
                console.error('[findChildrenByFilter] Logging error:', logError.message);
            }
        }

        const userData = await KindergartenRepository.findChildrenByFilter({
            limit,
            offset,
            sort_by,
            sort_direction,
            ...whereConditions
        });

        return paginationData(userData[0], page, limit, userData[1]);
    }


    async getChildById(request) {
        const { id } = request.params;

        const childData = await KindergartenRepository.getChildById(id);

        if (!childData || childData.length === 0) {
            throw new Error('Дитину не знайдено');
        }

        return childData[0];
    }

    async createChild(request) {
        const {
            child_name,
            parent_name,
            phone_number,
            kindergarten_name,
            group_id
        } = request.body;

        // Перевіряємо чи існує група
        const existingGroup = await KindergartenRepository.getGroupById(group_id);
        if (!existingGroup || existingGroup.length === 0) {
            throw new Error('Група не знайдена');
        }

        // Перевірка: назва садочка має співпадати з назвою садочка групи
        if (existingGroup[0].kindergarten_name !== kindergarten_name) {
            throw new Error('Назва садочка не співпадає з назвою садочка групи');
        }

        // Перевіряємо чи не існує дитина з таким іменем та батьками в цьому садочку
        const existingChild = await KindergartenRepository.getChildByNameAndParent(
            child_name,
            parent_name,
            kindergarten_name
        );

        if (existingChild && existingChild.length > 0) {
            throw new Error('Дитина з таким іменем та батьками вже існує в цьому садочку');
        }

        const childData = {
            child_name,
            parent_name,
            phone_number,
            kindergarten_name,
            group_id,
            created_at: new Date()
        };

        const result = await KindergartenRepository.createChild(childData);

        // Логування створення
        try {
            await logRepository.createLog({
                row_pk_id: result.insertId || result[0]?.id,
                uid: request?.user?.id,
                action: 'INSERT',
                client_addr: request?.ip,
                application_name: 'Створення дитини в садочку',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'ower',
                table_name: 'children_roster',
                oid: '16506',
            });
        } catch (logError) {
            console.error('[createChild] Logging error:', logError.message);
        }

        return result;
    }

    async updateChild(request) {
        const { id } = request.params;
        const updateData = request.body;

        // Перевіряємо чи існує дитина
        const existingChild = await KindergartenRepository.getChildById(id);
        if (!existingChild || existingChild.length === 0) {
            throw new Error('Дитину не знайдено');
        }

        // Якщо змінюється група, перевіряємо чи вона існує
        if (updateData.group_id) {
            const existingGroup = await KindergartenRepository.getGroupById(updateData.group_id);
            if (!existingGroup || existingGroup.length === 0) {
                throw new Error('Група не знайдена');
            }

            // Якщо змінюється група, автоматично оновлюємо назву садочка
            if (!updateData.kindergarten_name) {
                updateData.kindergarten_name = existingGroup[0].kindergarten_name;
            }

            // Перевірка: назва садочка має співпадати з назвою садочка групи
            if (updateData.kindergarten_name && existingGroup[0].kindergarten_name !== updateData.kindergarten_name) {
                throw new Error('Назва садочка не співпадає з назвою садочка групи');
            }
        }

        // Якщо змінюється ім'я дитини або батьків, перевіряємо на дублікати
        if (updateData.child_name || updateData.parent_name || updateData.kindergarten_name) {
            const childName = updateData.child_name || existingChild[0].child_name;
            const parentName = updateData.parent_name || existingChild[0].parent_name;
            const kindergartenName = updateData.kindergarten_name || existingChild[0].kindergarten_name;

            const duplicateChild = await KindergartenRepository.getChildByNameAndParent(
                childName,
                parentName,
                kindergartenName,
                id
            );

            if (duplicateChild && duplicateChild.length > 0) {
                throw new Error('Дитина з таким іменем та батьками вже існує в цьому садочку');
            }
        }

        const result = await KindergartenRepository.updateChild(id, updateData);

        // Логування оновлення
        try {
            await logRepository.createLog({
                row_pk_id: id,
                uid: request?.user?.id,
                action: 'UPDATE',
                client_addr: request?.ip,
                application_name: 'Оновлення даних дитини',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'ower',
                table_name: 'children_roster',
                oid: '16506',
            });
        } catch (logError) {
            console.error('[updateChild] Logging error:', logError.message);
        }

        return result;
    }

    async deleteChild(request) {
        const { id } = request.params;

        // Перевіряємо чи існує дитина
        const existingChild = await KindergartenRepository.getChildById(id);
        if (!existingChild || existingChild.length === 0) {
            throw new Error('Дитину не знайдено');
        }

        const result = await KindergartenRepository.deleteChild(id);

        // Логування видалення
        try {
            await logRepository.createLog({
                row_pk_id: id,
                uid: request?.user?.id,
                action: 'DELETE',
                client_addr: request?.ip,
                application_name: 'Видалення дитини з садочка',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'ower',
                table_name: 'children_roster',
                oid: '16506',
            });
        } catch (logError) {
            console.error('[deleteChild] Logging error:', logError.message);
        }

        return result;
    }

    // ===============================
    // МЕТОДИ ДЛЯ ВІДВІДУВАНОСТІ
    // ===============================

    async findAttendanceByFilter(request) {
        const { 
            page = 1, 
            limit = 16, 
            sort_by = 'child_name', 
            sort_direction = 'asc',
            child_name,
            group_name,
            kindergarten_name,
            date,
            attendance_status,
            ...whereConditions 
        } = request.body;

        const { offset } = paginate(page, limit);
        
        // Отримуємо поточну дату для України, якщо дата не вказана
        const getCurrentUkraineDate = () => {
            const now = new Date();
            const ukraineTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Kyiv' }));
            return ukraineTime.toISOString().split('T')[0];
        };
        
        const filterDate = date || getCurrentUkraineDate();
        
        // Логування пошуку якщо є параметри фільтрації
        if (child_name || group_name || kindergarten_name || attendance_status) {
            await logRepository.createLog({
                row_pk_id: null,
                uid: request?.user?.id,
                action: 'SEARCH',
                client_addr: request?.ip,
                application_name: 'Пошук відвідуваності',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'ower',
                table_name: 'attendance',
                oid: '16507',
            });
        }

        const userData = await KindergartenRepository.findAttendanceByFilter({
            limit,
            offset,
            sort_by,
            sort_direction,
            child_name,
            group_name,
            kindergarten_name,
            date: filterDate,
            attendance_status,
            ...whereConditions
        });

        return paginationData(userData[0], page, limit);
    }

    async getAttendanceById(request) {
        const { id } = request.params;
        
        const attendanceData = await KindergartenRepository.getAttendanceById(id);
        if (!attendanceData || attendanceData.length === 0) {
            throw new Error('Запис відвідуваності не знайдено');
        }

        return attendanceData[0];
    }

    async createAttendance(request) {
        const {
            date,
            child_id,
            attendance_status,
            notes
        } = request.body;

        // Перевіряємо чи існує дитина
        const existingChild = await KindergartenRepository.getChildById(child_id);
        if (!existingChild || existingChild.length === 0) {
            throw new Error('Дитину не знайдено');
        }

        // Перевіряємо чи не існує запис на цю дату для цієї дитини
        const existingAttendance = await KindergartenRepository.getAttendanceByDateAndChild(date, child_id);

        if (existingAttendance && existingAttendance.length > 0) {
            throw new Error('Запис відвідуваності на цю дату для цієї дитини вже існує');
        }

        const attendanceData = {
            date,
            child_id,
            attendance_status,
            notes,
            created_at: new Date()
        };

        const result = await KindergartenRepository.createAttendance(attendanceData);

        // Логування створення
        await logRepository.createLog({
            row_pk_id: result.insertId || result.id,
            uid: request?.user?.id,
            action: 'INSERT',
            client_addr: request?.ip,
            application_name: 'Створення запису відвідуваності',
            action_stamp_tx: new Date(),
            action_stamp_stm: new Date(),
            action_stamp_clk: new Date(),
            schema_name: 'ower',
            table_name: 'attendance',
            oid: '16507',
        });

        return result;
    }

    async updateAttendance(request) {
        const { id } = request.params;
        const updateData = request.body;

        // Перевіряємо чи існує запис
        const existingRecord = await KindergartenRepository.getAttendanceById(id);
        if (!existingRecord || existingRecord.length === 0) {
            throw new Error('Запис відвідуваності не знайдено');
        }

        // Якщо змінюється дитина, перевіряємо чи вона існує
        if (updateData.child_id) {
            const existingChild = await KindergartenRepository.getChildById(updateData.child_id);
            if (!existingChild || existingChild.length === 0) {
                throw new Error('Дитину не знайдено');
            }
        }

        // Якщо змінюється дата або дитина, перевіряємо на дублікати
        if (updateData.date && updateData.child_id) {
            const duplicateRecord = await KindergartenRepository.getAttendanceByDateAndChild(
                updateData.date, 
                updateData.child_id,
                id // виключаємо поточний запис
            );

            if (duplicateRecord && duplicateRecord.length > 0) {
                throw new Error('Запис відвідуваності на цю дату для цієї дитини вже існує');
            }
        }

        const result = await KindergartenRepository.updateAttendance(id, updateData);

        // Логування оновлення
        await logRepository.createLog({
            row_pk_id: id,
            uid: request?.user?.id,
            action: 'UPDATE',
            client_addr: request?.ip,
            application_name: 'Оновлення запису відвідуваності',
            action_stamp_tx: new Date(),
            action_stamp_stm: new Date(),
            action_stamp_clk: new Date(),
            schema_name: 'ower',
            table_name: 'attendance',
            oid: '16507',
        });

        return result;
    }

    async deleteAttendance(request) {
        const { id } = request.params;

        // Перевіряємо чи існує запис
        const existingRecord = await KindergartenRepository.getAttendanceById(id);
        if (!existingRecord || existingRecord.length === 0) {
            throw new Error('Запис відвідуваності не знайдено');
        }

        const result = await KindergartenRepository.deleteAttendance(id);

        // Логування видалення
        await logRepository.createLog({
            row_pk_id: id,
            uid: request?.user?.id,
            action: 'DELETE',
            client_addr: request?.ip,
            application_name: 'Видалення запису відвідуваності',
            action_stamp_tx: new Date(),
            action_stamp_stm: new Date(),
            action_stamp_clk: new Date(),
            schema_name: 'ower',
            table_name: 'attendance',
            oid: '16507',
        });

        return result;
    }

    // ===============================
    // МЕТОДИ ДЛЯ ВАРТОСТІ ХАРЧУВАННЯ
    // ===============================

    async findDailyFoodCostByFilter(request) {
        const { 
            page = 1, 
            limit = 16, 
            sort_by = 'date', 
            sort_direction = 'desc',
            date_from,
            date_to,
            ...whereConditions 
        } = request.body;

        const { offset } = paginate(page, limit);
        
        // Логування пошуку якщо є параметри фільтрації
        if (date_from || date_to) {
            await logRepository.createLog({
                row_pk_id: null,
                uid: request?.user?.id,
                action: 'SEARCH',
                client_addr: request?.ip,
                application_name: 'Пошук вартості харчування',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'ower',
                table_name: 'daily_food_cost',
                oid: '16508',
            });
        }

        const userData = await KindergartenRepository.findDailyFoodCostByFilter({
            limit,
            offset,
            sort_by,
            sort_direction,
            date_from,
            date_to,
            ...whereConditions
        });

        return paginationData(userData[0], page, limit);
    }

    async createDailyFoodCost(request) {
        const {
            date,
            young_group_cost,
            older_group_cost
        } = request.body;

        // Перевіряємо чи не існує запис з такою датою
        const existingRecord = await KindergartenRepository.getDailyFoodCostByDateAndExcludeId(date);

        if (existingRecord && existingRecord.length > 0) {
            throw new Error('Вартість харчування на цю дату вже існує');
        }

        const recordData = {
            date,
            young_group_cost,
            older_group_cost,
            created_at: new Date()
        };

        const result = await KindergartenRepository.createDailyFoodCost(recordData);

        // Логування створення
        await logRepository.createLog({
            row_pk_id: result.insertId || result.id,
            uid: request?.user?.id,
            action: 'INSERT',
            client_addr: request?.ip,
            application_name: 'Створення вартості харчування',
            action_stamp_tx: new Date(),
            action_stamp_stm: new Date(),
            action_stamp_clk: new Date(),
            schema_name: 'ower',
            table_name: 'daily_food_cost',
            oid: '16508',
        });

        return result;
    }

    async updateDailyFoodCost(request) {
        const { id } = request.params;
        const updateData = request.body;

        // Перевіряємо чи існує запис
        const existingRecord = await KindergartenRepository.getDailyFoodCostById(id);
        if (!existingRecord || existingRecord.length === 0) {
            throw new Error('Запис не знайдено');
        }

        // Якщо змінюється дата, перевіряємо на дублікати
        if (updateData.date) {
            const duplicateRecord = await KindergartenRepository.getDailyFoodCostByDateAndExcludeId(
                updateData.date, 
                id
            );

            if (duplicateRecord && duplicateRecord.length > 0) {
                throw new Error('Вартість харчування на цю дату вже існує');
            }
        }

        const result = await KindergartenRepository.updateDailyFoodCost(id, updateData);

        // Логування оновлення
        await logRepository.createLog({
            row_pk_id: id,
            uid: request?.user?.id,
            action: 'UPDATE',
            client_addr: request?.ip,
            application_name: 'Оновлення вартості харчування',
            action_stamp_tx: new Date(),
            action_stamp_stm: new Date(),
            action_stamp_clk: new Date(),
            schema_name: 'ower',
            table_name: 'daily_food_cost',
            oid: '16508',
        });

        return result;
    }

    async deleteDailyFoodCost(request) {
        const { id } = request.params;

        // Перевіряємо чи існує запис
        const existingRecord = await KindergartenRepository.getDailyFoodCostById(id);
        if (!existingRecord || existingRecord.length === 0) {
            throw new Error('Запис не знайдено');
        }

        const result = await KindergartenRepository.deleteDailyFoodCost(id);

        // Логування видалення
        await logRepository.createLog({
            row_pk_id: id,
            uid: request?.user?.id,
            action: 'DELETE',
            client_addr: request?.ip,
            application_name: 'Видалення вартості харчування',
            action_stamp_tx: new Date(),
            action_stamp_stm: new Date(),
            action_stamp_clk: new Date(),
            schema_name: 'ower',
            table_name: 'daily_food_cost',
            oid: '16508',
        });

        return result;
    }

    // ===============================
    // МЕТОДИ ДЛЯ БАТЬКІВСЬКОЇ ПЛАТИ
    // ===============================

    async findBillingByFilter(request) {
        const { 
            page = 1, 
            limit = 16, 
            sort_by = 'payment_month', 
            sort_direction = 'desc',
            payment_month_from,
            payment_month_to,
            parent_name,
            balance_min,
            balance_max,
            ...whereConditions 
        } = request.body;

        const { offset } = paginate(page, limit);
        
        // Логування пошуку якщо є параметри фільтрації
        if (payment_month_from || payment_month_to || parent_name || balance_min || balance_max) {
            await logRepository.createLog({
                row_pk_id: null,
                uid: request?.user?.id,
                action: 'SEARCH',
                client_addr: request?.ip,
                application_name: 'Пошук батьківської плати',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'ower',
                table_name: 'kindergarten_billing',
                oid: '16509',
            });
        }

        const userData = await KindergartenRepository.findBillingByFilter({
            limit,
            offset,
            sort_by,
            sort_direction,
            payment_month_from,
            payment_month_to,
            parent_name,
            balance_min,
            balance_max,
            ...whereConditions
        });

        return paginationData(userData[0], page, limit);
    }

    async getBillingById(request) {
        const { id } = request.params;
        
        const result = await KindergartenRepository.getBillingById(id);
        if (!result || result.length === 0) {
            throw new Error('Запис батьківської плати не знайдено');
        }

        // Логування перегляду
        await logRepository.createLog({
            row_pk_id: id,
            uid: request?.user?.id,
            action: 'VIEW',
            client_addr: request?.ip,
            application_name: 'Перегляд батьківської плати',
            action_stamp_tx: new Date(),
            action_stamp_stm: new Date(),
            action_stamp_clk: new Date(),
            schema_name: 'ower',
            table_name: 'kindergarten_billing',
            oid: '16509',
        });

        return result[0];
    }

    async createBilling(request) {
        const {
            parent_name,
            payment_month,
            current_debt = 0,
            current_accrual = 0,
            current_payment = 0,
            notes
        } = request.body;

        // Перевіряємо чи не існує запис з такими ПІБ та місяцем
        const existingRecord = await KindergartenRepository.getBillingByParentAndMonth(
            parent_name, 
            payment_month
        );

        if (existingRecord && existingRecord.length > 0) {
            throw new Error(`Запис батьківської плати для "${parent_name}" на ${new Date(payment_month).toLocaleDateString('uk-UA', { year: 'numeric', month: 'long' })} вже існує`);
        }

        const recordData = {
            parent_name,
            payment_month,
            current_debt,
            current_accrual,
            current_payment,
            notes,
            created_at: new Date()
        };

        const result = await KindergartenRepository.createBilling(recordData);

        // Логування створення
        await logRepository.createLog({
            row_pk_id: result.insertId || result.id,
            uid: request?.user?.id,
            action: 'INSERT',
            client_addr: request?.ip,
            application_name: 'Створення батьківської плати',
            action_stamp_tx: new Date(),
            action_stamp_stm: new Date(),
            action_stamp_clk: new Date(),
            schema_name: 'ower',
            table_name: 'kindergarten_billing',
            oid: '16509',
        });

        return result;
    }

    async updateBilling(request) {
        const { id } = request.params;
        const updateData = request.body;

        // Перевіряємо чи існує запис
        const existingRecord = await KindergartenRepository.getBillingById(id);
        if (!existingRecord || existingRecord.length === 0) {
            throw new Error('Запис не знайдено');
        }

        // Якщо змінюються ПІБ або місяць, перевіряємо на дублікати
        if (updateData.parent_name || updateData.payment_month) {
            const parent_name = updateData.parent_name || existingRecord[0].parent_name;
            const payment_month = updateData.payment_month || existingRecord[0].payment_month;
            
            const duplicateRecord = await KindergartenRepository.getBillingByParentAndMonthExcludeId(
                parent_name, 
                payment_month,
                id
            );

            if (duplicateRecord && duplicateRecord.length > 0) {
                throw new Error(`Запис батьківської плати для "${parent_name}" на ${new Date(payment_month).toLocaleDateString('uk-UA', { year: 'numeric', month: 'long' })} вже існує`);
            }
        }

        const result = await KindergartenRepository.updateBilling(id, updateData);

        // Логування оновлення
        await logRepository.createLog({
            row_pk_id: id,
            uid: request?.user?.id,
            action: 'UPDATE',
            client_addr: request?.ip,
            application_name: 'Оновлення батьківської плати',
            action_stamp_tx: new Date(),
            action_stamp_stm: new Date(),
            action_stamp_clk: new Date(),
            schema_name: 'ower',
            table_name: 'kindergarten_billing',
            oid: '16509',
        });

        return result;
    }

    async deleteBilling(request) {
        const { id } = request.params;

        // Перевіряємо чи існує запис
        const existingRecord = await KindergartenRepository.getBillingById(id);
        if (!existingRecord || existingRecord.length === 0) {
            throw new Error('Запис не знайдено');
        }

        const result = await KindergartenRepository.deleteBilling(id);

        // Логування видалення
        await logRepository.createLog({
            row_pk_id: id,
            uid: request?.user?.id,
            action: 'DELETE',
            client_addr: request?.ip,
            application_name: 'Видалення батьківської плати',
            action_stamp_tx: new Date(),
            action_stamp_stm: new Date(),
            action_stamp_clk: new Date(),
            schema_name: 'ower',
            table_name: 'kindergarten_billing',
            oid: '16509',
        });

        return result;
    }

    // ===============================
    // API ДЛЯ МОБІЛЬНОГО ДОДАТКУ
    // ===============================

    async getMobileAttendance(timestamp, request) {
        // Конвертуємо timestamp в дату
        const date = new Date(timestamp * 1000).toISOString().split('T')[0];
        
        // Отримуємо всі групи з дітьми та їх відвідуваністю на цю дату
        const groups = await KindergartenRepository.getMobileAttendanceByDate(date);
        
        // Логування
        if (request?.user?.id) {
            await logRepository.createLog({
                row_pk_id: null,
                uid: request.user.id,
                action: 'VIEW',
                client_addr: request?.ip,
                application_name: 'Мобільний додаток - перегляд відвідуваності',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'ower',
                table_name: 'attendance',
                oid: '16507',
            });
        }
        
        // Формуємо відповідь у форматі для мобільного додатку
        const response = {
            date: timestamp,
            groups: groups.map(group => ({
                id: group.group_id,
                name: group.group_name,
                group: group.children.map(child => ({
                    id: child.child_id,
                    name: child.child_name,
                    selected: child.attendance_status === 'present'
                }))
            }))
        };
        
        return response;
    }
    
    async saveMobileAttendance(request) {
        const { date, groups } = request.body;
        
        // Конвертуємо timestamp в дату
        const dateString = new Date(date * 1000).toISOString().split('T')[0];
        
        const results = [];
        const errors = [];
        
        // Проходимо по всіх групах та дітях
        for (const group of groups) {
            for (const child of group.group) {
                try {
                    const attendance_status = child.selected ? 'present' : 'absent';
                    
                    // Перевіряємо чи існує запис відвідуваності на цю дату для цієї дитини
                    const existingAttendance = await KindergartenRepository.getAttendanceByDateAndChild(
                        dateString, 
                        child.id
                    );
                    
                    if (existingAttendance && existingAttendance.length > 0) {
                        // Оновлюємо існуючий запис
                        await KindergartenRepository.updateAttendance(
                            existingAttendance[0].id,
                            { attendance_status }
                        );
                        results.push({
                            child_id: child.id,
                            action: 'updated',
                            status: attendance_status
                        });
                    } else {
                        // Створюємо новий запис
                        await KindergartenRepository.createAttendance({
                            date: dateString,
                            child_id: child.id,
                            attendance_status,
                            notes: null,
                            created_at: new Date()
                        });
                        results.push({
                            child_id: child.id,
                            action: 'created',
                            status: attendance_status
                        });
                    }
                } catch (error) {
                    errors.push({
                        child_id: child.id,
                        error: error.message
                    });
                }
            }
        }
        
        // Логування
        if (request?.user?.id) {
            await logRepository.createLog({
                row_pk_id: null,
                uid: request.user.id,
                action: 'UPDATE',
                client_addr: request?.ip,
                application_name: 'Мобільний додаток - збереження відвідуваності',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'ower',
                table_name: 'attendance',
                oid: '16507',
            });
        }
        
        return {
            success: results.length,
            errors: errors.length,
            details: {
                results,
                errors
            }
        };
    }

    // ===============================
    // МЕТОДИ ДЛЯ АДМІНІСТРАТОРІВ САДОЧКА
    // ===============================

    async findAdminsByFilter(request) {
        const { 
            page = 1, 
            limit = 16, 
            sort_by = 'id', 
            sort_direction = 'desc',
            phone_number,
            full_name,
            kindergarten_name,
            role,
            ...whereConditions 
        } = request.body;

        const { offset } = paginate(page, limit);
        
        // Логування пошуку якщо є параметри фільтрації
        if (phone_number || full_name || kindergarten_name || role) {
            await logRepository.createLog({
                row_pk_id: null,
                uid: request?.user?.id,
                action: 'SEARCH',
                client_addr: request?.ip,
                application_name: 'Пошук адміністраторів садочка',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'ower',
                table_name: 'kindergarten_admins',
                oid: '16510',
            });
        }

        const userData = await KindergartenRepository.findAdminsByFilter({
            limit,
            offset,
            sort_by,
            sort_direction,
            phone_number,
            full_name,
            kindergarten_name,
            role,
            ...whereConditions
        });

        return paginationData(userData[0], page, limit);
    }

    async getAdminById(request) {
        const { id } = request.params;
        
        const adminData = await KindergartenRepository.getAdminById(id);
        if (!adminData || adminData.length === 0) {
            throw new Error('Адміністратора не знайдено');
        }

        return adminData[0];
    }

    async createAdmin(request) {
        const {
            phone_number,
            full_name,
            kindergarten_name,
            role = 'educator'
        } = request.body;

        // Перевіряємо чи не існує адміністратор з таким номером телефону
        const existingAdmin = await KindergartenRepository.getAdminByPhone(phone_number);

        if (existingAdmin && existingAdmin.length > 0) {
            throw new Error('Адміністратор з таким номером телефону вже існує');
        }

        const adminData = {
            phone_number,
            full_name,
            kindergarten_name,
            role,
            created_at: new Date()
        };

        const result = await KindergartenRepository.createAdmin(adminData);

        // Логування створення
        await logRepository.createLog({
            row_pk_id: result.insertId || result[0]?.id,
            uid: request?.user?.id,
            action: 'INSERT',
            client_addr: request?.ip,
            application_name: 'Створення адміністратора садочка',
            action_stamp_tx: new Date(),
            action_stamp_stm: new Date(),
            action_stamp_clk: new Date(),
            schema_name: 'ower',
            table_name: 'kindergarten_admins',
            oid: '16510',
        });

        return result;
    }

    async updateAdmin(request) {
        const { id } = request.params;
        const updateData = request.body;

        // Перевіряємо чи існує адміністратор
        const existingAdmin = await KindergartenRepository.getAdminById(id);
        if (!existingAdmin || existingAdmin.length === 0) {
            throw new Error('Адміністратора не знайдено');
        }

        // Якщо змінюється номер телефону, перевіряємо на дублікати
        if (updateData.phone_number) {
            const duplicateAdmin = await KindergartenRepository.getAdminByPhone(
                updateData.phone_number,
                id
            );

            if (duplicateAdmin && duplicateAdmin.length > 0) {
                throw new Error('Адміністратор з таким номером телефону вже існує');
            }
        }

        const result = await KindergartenRepository.updateAdmin(id, updateData);

        // Логування оновлення
        await logRepository.createLog({
            row_pk_id: id,
            uid: request?.user?.id,
            action: 'UPDATE',
            client_addr: request?.ip,
            application_name: 'Оновлення адміністратора садочка',
            action_stamp_tx: new Date(),
            action_stamp_stm: new Date(),
            action_stamp_clk: new Date(),
            schema_name: 'ower',
            table_name: 'kindergarten_admins',
            oid: '16510',
        });

        return result;
    }

    async deleteAdmin(request) {
        const { id } = request.params;

        // Перевіряємо чи існує адміністратор
        const existingAdmin = await KindergartenRepository.getAdminById(id);
        if (!existingAdmin || existingAdmin.length === 0) {
            throw new Error('Адміністратора не знайдено');
        }

        const result = await KindergartenRepository.deleteAdmin(id);

        // Логування видалення
        await logRepository.createLog({
            row_pk_id: id,
            uid: request?.user?.id,
            action: 'DELETE',
            client_addr: request?.ip,
            application_name: 'Видалення адміністратора садочка',
            action_stamp_tx: new Date(),
            action_stamp_stm: new Date(),
            action_stamp_clk: new Date(),
            schema_name: 'ower',
            table_name: 'kindergarten_admins',
            oid: '16510',
        });

        return result;
    }

    // ===============================
    // ПЕРЕВІРКА ЧИ Є ВИХОВАТЕЛЕМ
    // ===============================

    async verifyEducator(request) {
        try {
            let { phone_number } = request.body;

            // ПЕРЕВІРКА 1: Номер телефону обов'язковий
            if (!phone_number) {
                throw new Error('Номер телефону обов\'язковий');
            }

            console.log('[verifyEducator] Original phone:', phone_number);

            // НОРМАЛІЗАЦІЯ НОМЕРА: видаляємо пробіли, дужки, дефіси
            phone_number = phone_number.replace(/[\s\-\(\)]/g, '');
            
            // Якщо номер починається з 0, додаємо +38
            if (phone_number.startsWith('0')) {
                phone_number = '+38' + phone_number;
            }
            
            // Якщо немає +, додаємо +
            if (!phone_number.startsWith('+')) {
                phone_number = '+' + phone_number;
            }

            console.log('[verifyEducator] Normalized phone:', phone_number);

            // ЗАПИТ ДО БАЗИ ДАНИХ
            let educator;
            try {
                educator = await KindergartenRepository.verifyEducator(phone_number);
                console.log('[verifyEducator] Database result:', educator);
            } catch (dbError) {
                console.error('[verifyEducator] Database error:', dbError);
                throw new Error(`Помилка запиту до бази даних: ${dbError.message}`);
            }

            // ЛОГУВАННЯ (з обробкою помилок)
            if (request?.user?.id) {
                try {
                    await logRepository.createLog({
                        row_pk_id: educator && educator.length > 0 ? educator[0].id : null,
                        uid: request.user.id,
                        action: 'VIEW',
                        client_addr: request?.ip,
                        application_name: 'Перевірка вихователя (мобільний додаток)',
                        action_stamp_tx: new Date(),
                        action_stamp_stm: new Date(),
                        action_stamp_clk: new Date(),
                        schema_name: 'ower',
                        table_name: 'kindergarten_admins',
                        oid: '16510',
                    });
                } catch (logError) {
                    // Логування не критично - просто виводимо в консоль
                    console.error('[verifyEducator] Logging error (non-critical):', logError.message);
                }
            } else {
                console.warn('[verifyEducator] request.user.id not found - logging skipped');
            }

            // ПОВЕРТАЄМО РЕЗУЛЬТАТ
            const result = {
                isEducator: educator && educator.length > 0,
                educatorInfo: educator && educator.length > 0 ? {
                    id: educator[0].id,
                    phone_number: educator[0].phone_number,
                    full_name: educator[0].full_name,
                    kindergarten_name: educator[0].kindergarten_name
                } : null
            };

            console.log('[verifyEducator] Final result:', result);
            
            return result;

        } catch (error) {
            console.error('[verifyEducator] Fatal error:', error);
            throw error; // Передаємо помилку далі в controller
        }
    }
}

module.exports = new KindergartenService();