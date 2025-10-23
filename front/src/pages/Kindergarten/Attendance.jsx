import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom'
import classNames from 'classnames';
import useFetch from "../../hooks/useFetch";
import Table from "../../components/common/Table/Table";
import {generateIcon, iconMap, STATUS} from "../../utils/constants.jsx";
import Button from "../../components/common/Button/Button";
import PageError from "../ErrorPage/PageError";
import Pagination from "../../components/common/Pagination/Pagination";
import {fetchFunction, hasOnlyAllowedParams, validateFilters} from "../../utils/function";
import {useNotification} from "../../hooks/useNotification";
import {Context} from "../../main";
import Dropdown from "../../components/common/Dropdown/Dropdown";
import SkeletonPage from "../../components/common/Skeleton/SkeletonPage";
import {Transition} from "react-transition-group";
import Input from "../../components/common/Input/Input";
import Select from "../../components/common/Select/Select";

// Іконки
const checkIcon = generateIcon(iconMap.check, null, 'currentColor', 16, 16)
const filterIcon = generateIcon(iconMap.filter, null, 'currentColor', 20, 20)
const dropDownIcon = generateIcon(iconMap.arrowDown, null, 'currentColor', 20, 20)
const sortUpIcon = generateIcon(iconMap.arrowUp, 'sort-icon', 'currentColor', 14, 14)
const sortDownIcon = generateIcon(iconMap.arrowDown, 'sort-icon', 'currentColor', 14, 14)
const dropDownStyle = {width: '100%'}

// Константи для збереження стану
const ATTENDANCE_STATE_KEY = 'attendanceState';

const saveAttendanceState = (state) => {
    try {
        sessionStorage.setItem(ATTENDANCE_STATE_KEY, JSON.stringify({
            sendData: state.sendData,
            selectData: state.selectData,
            isFilterOpen: state.isFilterOpen,
            timestamp: Date.now()
        }));
    } catch (error) {
        console.warn('Failed to save attendance state:', error);
    }
};

const loadAttendanceState = () => {
    try {
        const saved = sessionStorage.getItem(ATTENDANCE_STATE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Перевіряємо чи дані не старіші 30 хвилин
            if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
                return parsed;
            }
        }
    } catch (error) {
        console.warn('Failed to load attendance state:', error);
    }
    return null;
};

const clearAttendanceState = () => {
    try {
        sessionStorage.removeItem(ATTENDANCE_STATE_KEY);
    } catch (error) {
        console.warn('Failed to clear attendance state:', error);
    }
};

// Опції для статусів відвідуваності
const ATTENDANCE_STATUS_OPTIONS = [
    { value: 'present', label: 'Присутній(-я)' },
    { value: 'absent', label: 'Відсутній(-я)' },
    { value: 'sick', label: 'Хворий(-а)' },
    { value: 'vacation', label: 'Відпустка' }
];

const Attendance = () => {
    const navigate = useNavigate()
    const notification = useNotification()
    const {store} = useContext(Context)
    const nodeRef = useRef(null)
    
    const [stateAttendance, setStateAttendance] = useState(() => {
        const savedState = loadAttendanceState();
        
        // Отримуємо поточну дату для України (UTC+2/UTC+3)
        const getCurrentUkraineDate = () => {
            const now = new Date();
            const ukraineTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Kyiv' }));
            return ukraineTime.toISOString().split('T')[0];
        };
        
        const currentDate = getCurrentUkraineDate();
        
        if (savedState) {
            return {
                isFilterOpen: savedState.isFilterOpen || false,
                selectData: savedState.selectData || { date: currentDate },
                confirmLoading: false,
                itemId: null,
                sendData: savedState.sendData || {
                    limit: 16,
                    page: 1,
                    sort_by: 'child_name',
                    sort_direction: 'asc',
                    date: currentDate
                }
            };
        }
        
        // Початковий стан за замовчуванням
        return {
            isFilterOpen: false,
            selectData: { date: currentDate },
            confirmLoading: false,
            itemId: null,
            sendData: {
                limit: 16,
                page: 1,
                sort_by: 'child_name',
                sort_direction: 'asc',
                date: currentDate
            }
        };
    });

    const isFirstAPI = useRef(true);
    const {error, status, data, retryFetch} = useFetch('api/kindergarten/attendance/filter', {
        method: 'post',
        data: stateAttendance.sendData
    })
    
    const startRecord = ((stateAttendance.sendData.page || 1) - 1) * stateAttendance.sendData.limit + 1;
    const endRecord = Math.min(startRecord + stateAttendance.sendData.limit - 1, data?.totalItems || 1);

    useEffect(() => {
        if (isFirstAPI.current) {
            isFirstAPI.current = false;
            return;
        }
        
        retryFetch('api/kindergarten/attendance/filter', {
            method: 'post',
            data: stateAttendance.sendData
        });
    }, [stateAttendance.sendData, retryFetch]);

    // Збереження стану при зміні
    useEffect(() => {
        saveAttendanceState(stateAttendance);
    }, [stateAttendance]);

    // Очищення стану при виході зі сторінки
    useEffect(() => {
        return () => {
            clearAttendanceState();
        };
    }, []);

    const getSortIcon = useCallback((columnName) => {
        if (stateAttendance.sendData.sort_by === columnName) {
            return stateAttendance.sendData.sort_direction === 'asc' ? sortUpIcon : sortDownIcon;
        }
        return null;
    }, [stateAttendance.sendData.sort_by, stateAttendance.sendData.sort_direction]);

    const handleSort = useCallback((columnName) => {
        const currentSort = stateAttendance.sendData;
        let newDirection = 'asc';
        
        if (currentSort.sort_by === columnName) {
            newDirection = currentSort.sort_direction === 'asc' ? 'desc' : 'asc';
        }
        
        setStateAttendance(prevState => ({
            ...prevState,
            sendData: {
                ...prevState.sendData,
                sort_by: columnName,
                sort_direction: newDirection,
                page: 1
            }
        }));
    }, [stateAttendance.sendData]);

    // Функція для перемикання присутності
    const toggleAttendance = async (record) => {
        const newStatus = record.attendance_status === 'present' ? 'absent' : 'present';
        
        // Отримуємо дату з sendData або selectData
        const currentDate = stateAttendance.sendData.date || stateAttendance.selectData.date;
        
        if (!currentDate) {
            notification({
                type: 'error',
                placement: 'top',
                title: 'Помилка',
                message: 'Будь ласка, оберіть дату',
            });
            return;
        }
        
        try {
            if (record.attendance_id) {
                // Оновлюємо існуючий запис
                await fetchFunction(`api/kindergarten/attendance/${record.attendance_id}`, {
                    method: 'PUT',
                    data: {
                        attendance_status: newStatus
                    }
                });
            } else {
                // Створюємо новий запис відвідуваності для дитини
                await fetchFunction('api/kindergarten/attendance', {
                    method: 'POST',
                    data: {
                        date: currentDate,
                        child_id: record.child_id,
                        attendance_status: newStatus
                    }
                });
            }

            notification({
                type: 'success',
                placement: 'top',
                title: 'Успіх',
                message: 'Відвідуваність оновлено успішно',
            });

            retryFetch('api/kindergarten/attendance/filter', {
                method: 'post',
                data: stateAttendance.sendData,
            });

        } catch (error) {
            notification({
                type: 'error',
                placement: 'top',
                title: 'Помилка',
                message: error.message || 'Не вдалося оновити відвідуваність',
            });
        }
    };

    const columns = useMemo(() => {
        const columns = [
            {
                title: 'Дата',
                dataIndex: 'attendance_date',
                key: 'attendance_date',
                width: 120,
                render: (date) => {
                    const displayDate = stateAttendance.sendData.date || stateAttendance.selectData.date;
                    return new Date(displayDate).toLocaleDateString('uk-UA');
                }
            },
            {
                title: (
                    <div 
                        className={`sortable-header ${stateAttendance.sendData.sort_by === 'child_name' ? 'active' : ''}`}
                        onClick={() => handleSort('child_name')}
                    >
                        <span>ПІБ дитини</span>
                        <div className="sort-icon-wrapper">
                            {getSortIcon('child_name')}
                        </div>
                    </div>
                ),
                dataIndex: 'child_name',
                key: 'child_name',
                sorter: false,
            },
            {
                title: (
                    <div 
                        className={`sortable-header ${stateAttendance.sendData.sort_by === 'group_name' ? 'active' : ''}`}
                        onClick={() => handleSort('group_name')}
                    >
                        <span>Група</span>
                        <div className="sort-icon-wrapper">
                            {getSortIcon('group_name')}
                        </div>
                    </div>
                ),
                dataIndex: 'group_name',
                key: 'group_name',
                sorter: false,
            },
            {
                title: 'Садочок',
                dataIndex: 'kindergarten_name',
                key: 'kindergarten_name',
            },
            {
                title: 'Присутність',
                dataIndex: 'attendance_status',
                key: 'attendance_status',
                render: (status) => {
                    const statusConfig = {
                        present: { color: '#52c41a', label: 'Присутній(-я)' },
                        absent: { color: '#f5222d', label: 'Відсутній(-я)' },
                        sick: { color: '#faad14', label: 'Хворий(-а)' },
                        vacation: { color: '#1890ff', label: 'Відпустка' }
                    };
                    
                    const config = statusConfig[status] || statusConfig.absent;
                    
                    return (
                        <div style={{ textAlign: 'center' }}>
                            <span style={{ 
                                color: config.color, 
                                fontWeight: '600'
                            }}>
                                {config.label}
                            </span>
                        </div>
                    );
                }
            },
            {
                title: 'Дія',
                key: 'actions',
                render: (_, record) => (
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                    }}>
                        <Button
                            title={record.attendance_status === 'present' ? 'Відмітити відсутність' : 'Відмітити присутність'}
                            icon={checkIcon}
                            size="small"
                            className={record.attendance_status === 'present' ? 'btn--secondary' : 'btn--primary'}
                            onClick={() => toggleAttendance(record)}
                        >
                            {record.attendance_status === 'present' ? 'Відмітити відсутність' : 'Відмітити присутність'}
                        </Button>
                    </div>
                ),
            }
        ];
        return columns;
    }, [stateAttendance.sendData.sort_by, stateAttendance.sendData.sort_direction, stateAttendance.sendData.date, stateAttendance.selectData.date]);

    const tableData = useMemo(() => {
        if (data?.items?.length) {
            const currentDate = stateAttendance.sendData.date || stateAttendance.selectData.date;
            return data.items.map((el) => ({
                key: `${el.child_id}`,
                child_id: el.child_id,
                child_name: el.child_name,
                group_name: el.group_name,
                kindergarten_name: el.kindergarten_name,
                attendance_id: el.attendance_id,
                attendance_status: el.attendance_status || 'absent',
                attendance_date: currentDate, // ДОДАЙТЕ ЦЕ
            }));
        }
        return [];
    }, [data, stateAttendance.sendData.date, stateAttendance.selectData.date])

    const itemMenu = [
        {
            label: '16',
            key: '16',
            onClick: () => {
                if (stateAttendance.sendData.limit !== 16) {
                    setStateAttendance(prevState => ({
                        ...prevState,
                        sendData: {
                            ...prevState.sendData,
                            limit: 16,
                            page: 1,
                        }
                    }))
                }
            },
        },
        {
            label: '32',
            key: '32',
            onClick: () => {
                if (stateAttendance.sendData.limit !== 32) {
                    setStateAttendance(prevState => ({
                        ...prevState,
                        sendData: {
                            ...prevState.sendData,
                            limit: 32,
                            page: 1,
                        }
                    }))
                }
            },
        },
        {
            label: '48',
            key: '48',
            onClick: () => {
                if (stateAttendance.sendData.limit !== 48) {
                    setStateAttendance(prevState => ({
                        ...prevState,
                        sendData: {
                            ...prevState.sendData,
                            limit: 48,
                            page: 1,
                        }
                    }))
                }
            },
        },
    ];

    const filterHandleClick = () => {
        setStateAttendance(prevState => ({
            ...prevState,
            isFilterOpen: !prevState.isFilterOpen,
        }))
    }

    // Перевіряємо чи є активні фільтри
    const hasActiveFilters = useMemo(() => {
        return Object.values(stateAttendance.selectData).some(value => {
            if (Array.isArray(value)) return value.length > 0;
            return value !== '' && value !== null && value !== undefined;
        });
    }, [stateAttendance.selectData]);

    const onHandleChange = useCallback((field, value) => {
        setStateAttendance(prevState => ({
            ...prevState,
            selectData: {
                ...prevState.selectData,
                [field]: value,
            }
        }))
    }, [])

    const resetFilter = () => {
        setStateAttendance(prevState => ({
            ...prevState,
            selectData: {},
            sendData: {
                limit: prevState.sendData.limit,
                page: 1,
                sort_by: 'date',
                sort_direction: 'desc',
            }
        }))
    }

    const applyFilter = () => {
        const isAnyInputFilled = Object.values(stateAttendance.selectData).some(value => {
            if (Array.isArray(value) && !value.length) {
                return false
            }
            return value
        })
        if (isAnyInputFilled) {
            const dataValidation = validateFilters(stateAttendance.selectData)
            if (!dataValidation.error) {
                setStateAttendance(prevState => ({
                    ...prevState,
                    sendData: {
                        ...dataValidation,
                        limit: prevState.sendData.limit,
                        page: 1,
                        sort_by: prevState.sendData.sort_by,
                        sort_direction: prevState.sendData.sort_direction,
                    }
                }))
            } else {
                notification({
                    type: 'warning',
                    placement: 'top',
                    title: 'Помилка',
                    message: dataValidation.message ?? 'Щось пішло не так.',
                })
            }
        }
    }

    const onPageChange = useCallback((page) => {
        if (stateAttendance.sendData.page !== page) {
            setStateAttendance(prevState => ({
                ...prevState,
                sendData: {
                    ...prevState.sendData,
                    page,
                }
            }))
        }
    }, [stateAttendance.sendData.page])

    // Рендер
    if (status === STATUS.ERROR) {
        return <PageError title={error.message} statusError={error.status} />;
    }

    return (
        <>
            {status === STATUS.PENDING && <SkeletonPage />}

            {status === STATUS.SUCCESS && (
                <>
                    <div className="table-elements">
                        <div className="table-header">
                            <h2 className="title title--sm">
                                {data?.items?.length ? (
                                    <>
                                        Показує {startRecord !== endRecord ? `${startRecord}-${endRecord}` : startRecord} з {data?.totalItems || 1}
                                    </>
                                ) : (
                                    <>Записів не знайдено</>
                                )}
                            </h2>

                            <div className="table-header__buttons">          
                                <Dropdown
                                    icon={dropDownIcon}
                                    iconPosition="right"
                                    style={dropDownStyle}
                                    caption={`Записів: ${stateAttendance.sendData.limit}`}
                                    menu={itemMenu}
                                />
                                
                                <Button
                                    className={classNames("table-filter-trigger", {
                                        "has-active-filters": hasActiveFilters
                                    })}
                                    onClick={filterHandleClick}
                                    icon={filterIcon}
                                >
                                    Фільтри
                                </Button>
                            </div>
                        </div>

                        <div className="table-main">
                            <div 
                                style={{width: data?.items?.length > 0 ? 'auto' : '100%'}} 
                                className={classNames("table-and-pagination-wrapper", {
                                    "table-and-pagination-wrapper--active": stateAttendance.isFilterOpen
                                })}
                            >
                                <Table columns={columns} dataSource={tableData} />
                                <Pagination
                                    className="m-b"
                                    currentPage={Number(data?.currentPage) || 1}
                                    totalCount={data?.totalItems || 1}
                                    pageSize={stateAttendance.sendData.limit}
                                    onPageChange={onPageChange}
                                />
                            </div>

                            <Transition in={stateAttendance.isFilterOpen} timeout={300} nodeRef={nodeRef}>
                                {state => (
                                    <div 
                                        ref={nodeRef}
                                        className={classNames("table-filter", {
                                            "table-filter--active": stateAttendance.isFilterOpen
                                        })}
                                        style={{
                                            display: state === 'exited' ? 'none' : 'block'
                                        }}
                                    >
                                        <h3 className="title title--sm">
                                            Фільтри відвідуваності
                                        </h3>
                                        <div className="btn-group">
                                            <Button onClick={applyFilter}>
                                                Застосувати
                                            </Button>
                                            <Button className="btn--secondary" onClick={resetFilter}>
                                                Скинути
                                            </Button>
                                        </div>
                                        
                                        <div className="table-filter__item">
                                            <h4 className="input-description">ПІБ дитини</h4>
                                            <Input
                                                placeholder="Введіть ПІБ"
                                                value={stateAttendance.selectData.child_name || ''}
                                                onChange={(e) => onHandleChange('child_name', e.target.value)}
                                            />
                                        </div>

                                        <div className="table-filter__item">
                                            <h4 className="input-description">Назва групи</h4>
                                            <Input
                                                placeholder="Введіть назву групи"
                                                value={stateAttendance.selectData.group_name || ''}
                                                onChange={(e) => onHandleChange('group_name', e.target.value)}
                                            />
                                        </div>

                                        <div className="table-filter__item">
                                            <h4 className="input-description">Назва садочка</h4>
                                            <Input
                                                placeholder="Введіть назву садочка"
                                                value={stateAttendance.selectData.kindergarten_name || ''}
                                                onChange={(e) => onHandleChange('kindergarten_name', e.target.value)}
                                            />
                                        </div>

                                        <div className="table-filter__item">
                                            <h4 className="input-description">Статус відвідуваності</h4>
                                            <Select
                                                placeholder="Оберіть статус"
                                                value={
                                                    stateAttendance.selectData.attendance_status 
                                                        ? ATTENDANCE_STATUS_OPTIONS.find(opt => opt.value === stateAttendance.selectData.attendance_status) 
                                                        : null
                                                }
                                                onChange={(value) => onHandleChange('attendance_status', value?.value || null)}
                                                options={ATTENDANCE_STATUS_OPTIONS}
                                                isClearable
                                            />
                                        </div>

                                        <div className="table-filter__item">
                                            <h4 className="input-description">Дата від</h4>
                                            <Input
                                                type="date"
                                                value={stateAttendance.selectData.date_from || ''}
                                                onChange={(e) => onHandleChange('date_from', e.target.value)}
                                            />
                                        </div>

                                        <div className="table-filter__item">
                                            <h4 className="input-description">Дата до</h4>
                                            <Input
                                                type="date"
                                                value={stateAttendance.selectData.date_to || ''}
                                                onChange={(e) => onHandleChange('date_to', e.target.value)}
                                            />
                                        </div>

                                        <div className="table-filter__item">
                                            <h4 className="input-description">Дата</h4>
                                            <Input
                                                type="date"
                                                value={stateAttendance.selectData.date || ''}
                                                onChange={(e) => {
                                                    const newDate = e.target.value;
                                                    onHandleChange('date', newDate);
                                                    // Одразу застосовуємо фільтр при зміні дати
                                                    setStateAttendance(prevState => ({
                                                        ...prevState,
                                                        selectData: {
                                                            ...prevState.selectData,
                                                            date: newDate
                                                        },
                                                        sendData: {
                                                            ...prevState.sendData,
                                                            date: newDate,
                                                            page: 1
                                                        }
                                                    }));
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </Transition>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default Attendance;