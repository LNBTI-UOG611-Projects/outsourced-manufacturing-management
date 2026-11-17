-- Integrated Outsourced Manufacturing and Distribution Management System
-- PostgreSQL schema baseline

BEGIN;

CREATE SCHEMA IF NOT EXISTS iomdms;
SET LOCAL search_path TO iomdms, public;

-- IDENTITY :: system_users
CREATE TABLE system_users (
    user_id UUID PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    profile_pic TEXT,
    role VARCHAR(40) NOT NULL,
    email VARCHAR(254) NOT NULL,
    password_hash TEXT NOT NULL,
    account_status VARCHAR(40) NOT NULL,

    CONSTRAINT ck_system_users_role CHECK (
        role IN ('admin', 'manager', 'supervisor', 'outside_worker', 'delivery_staff')
    ),
    CONSTRAINT ck_system_users_account_status CHECK (
        account_status IN ('active', 'deactivated')
    )
);

CREATE UNIQUE INDEX uq_system_users_email_ci
    ON system_users (LOWER(email));

-- IDENTITY :: zones
CREATE TABLE zones (
    zone_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_name VARCHAR(160) NOT NULL,
    -- Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4,
    -- Friday = 5, Saturday = 6, Sunday = 7.
    delivery_day SMALLINT NOT NULL,

    CONSTRAINT ck_zones_1 CHECK (delivery_day BETWEEN 1 AND 7)
);

-- MANUFACTURING :: net_types
CREATE TABLE net_types (
    net_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_name VARCHAR(150) NOT NULL,
    unit_mfg_price NUMERIC(12,2) NOT NULL,

    CONSTRAINT ck_net_types_unit_mfg_price CHECK (unit_mfg_price >= 0)
);

-- SUPPORT :: equipment
CREATE TABLE equipment (
    equipment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_name VARCHAR(160) NOT NULL,
    category VARCHAR(50) NOT NULL,
    available_quantity INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT ck_equipment_1 CHECK (available_quantity >= 0)
);

-- SUPPORT :: notifications
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    sender_type VARCHAR(10) NOT NULL,
    sender_user_id UUID,
    reference_type VARCHAR(80),
    reference_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_notifications_sender
        FOREIGN KEY (sender_user_id) REFERENCES system_users (user_id) ON DELETE RESTRICT,
    CONSTRAINT ck_notifications_sender CHECK (
        (sender_type = 'system' AND sender_user_id IS NULL)
        OR (sender_type = 'user' AND sender_user_id IS NOT NULL)
    )
);

-- IDENTITY :: admins
CREATE TABLE admins (
    user_id UUID PRIMARY KEY,

    CONSTRAINT fk_admins_1
        FOREIGN KEY (user_id) REFERENCES system_users (user_id) ON DELETE CASCADE
);

-- IDENTITY :: company_staff
CREATE TABLE company_staff (
    user_id UUID PRIMARY KEY,
    employee_code VARCHAR(40) NOT NULL,
    contact_no VARCHAR(40),
    nic VARCHAR(40) UNIQUE,
    status VARCHAR(40) NOT NULL,
    description TEXT,

    CONSTRAINT uq_company_staff_employee_code UNIQUE (employee_code),
    CONSTRAINT fk_company_staff_user
        FOREIGN KEY (user_id) REFERENCES system_users (user_id) ON DELETE CASCADE,
    CONSTRAINT ck_company_staff_status CHECK (status IN ('active', 'inactive'))
);

-- ROUTING :: routes
-- A generated route proposal. Do not overwrite approved stop order used by a journey.
CREATE TABLE routes (
    route_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID NOT NULL,
    route_name VARCHAR(180) NOT NULL,
    status VARCHAR(40) NOT NULL,
    generated_at TIMESTAMPTZ,
    optimization_status VARCHAR(60),
    estimated_duration_min INTEGER,

    CONSTRAINT fk_routes_1
        FOREIGN KEY (zone_id) REFERENCES zones (zone_id) ON DELETE RESTRICT,
    CONSTRAINT ck_routes_1 CHECK (estimated_duration_min IS NULL OR estimated_duration_min >= 0),
    CONSTRAINT ck_routes_status CHECK (status IN ('proposed', 'approved', 'rejected')),
    CONSTRAINT ck_routes_optimization_status CHECK (
        optimization_status IS NULL OR optimization_status IN ('pending', 'succeeded', 'failed')
    )
);

-- SUPPORT :: user_notifications
CREATE TABLE user_notifications (
    user_notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL,
    user_id UUID NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,

    CONSTRAINT fk_user_notifications_1
        FOREIGN KEY (notification_id) REFERENCES notifications (notification_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_notifications_2
        FOREIGN KEY (user_id) REFERENCES system_users (user_id) ON DELETE CASCADE,
    CONSTRAINT uq_user_notifications_1 UNIQUE (notification_id, user_id)
);

-- SUPPORT :: audit_logs
CREATE TABLE audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(80) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_audit_logs_1
        FOREIGN KEY (actor_user_id) REFERENCES system_users (user_id) ON DELETE RESTRICT
);

-- IDENTITY :: managers
CREATE TABLE managers (
    user_id UUID PRIMARY KEY,

    CONSTRAINT fk_managers_1
        FOREIGN KEY (user_id) REFERENCES company_staff (user_id) ON DELETE CASCADE
);

-- IDENTITY :: supervisors
CREATE TABLE supervisors (
    user_id UUID PRIMARY KEY,

    CONSTRAINT fk_supervisors_1
        FOREIGN KEY (user_id) REFERENCES company_staff (user_id) ON DELETE CASCADE
);

-- IDENTITY :: outside_workers
CREATE TABLE outside_workers (
    user_id UUID PRIMARY KEY,
    zone_id UUID NOT NULL,
    address TEXT NOT NULL,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),

    CONSTRAINT fk_outside_workers_1
        FOREIGN KEY (user_id) REFERENCES company_staff (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_outside_workers_2
        FOREIGN KEY (zone_id) REFERENCES zones (zone_id) ON DELETE RESTRICT,
    CONSTRAINT ck_outside_workers_1 CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
    CONSTRAINT ck_outside_workers_2 CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
    CONSTRAINT ck_outside_workers_coordinate_pair CHECK ((latitude IS NULL) = (longitude IS NULL))
);

-- IDENTITY :: supervisor_zone_assignments
CREATE TABLE supervisor_zone_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manager_id UUID NOT NULL,
    supervisor_id UUID NOT NULL,
    zone_id UUID NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    status VARCHAR(40) NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_supervisor_zone_assignments_1
        FOREIGN KEY (manager_id) REFERENCES managers (user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_supervisor_zone_assignments_2
        FOREIGN KEY (supervisor_id) REFERENCES supervisors (user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_supervisor_zone_assignments_3
        FOREIGN KEY (zone_id) REFERENCES zones (zone_id) ON DELETE RESTRICT,
    CONSTRAINT ck_supervisor_zone_assignments_1
        CHECK (effective_to IS NULL OR effective_to >= effective_from),
    CONSTRAINT ck_supervisor_zone_assignments_status
        CHECK (status IN ('scheduled', 'active', 'ended', 'cancelled'))
);

-- ROUTING :: route_stops
-- Stop order belongs to the generated route, not to the worker.
CREATE TABLE route_stops (
    stop_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL,
    outside_worker_id UUID NOT NULL,
    stop_sequence INTEGER,

    CONSTRAINT fk_route_stops_1
        FOREIGN KEY (route_id) REFERENCES routes (route_id) ON DELETE CASCADE,
    CONSTRAINT fk_route_stops_2
        FOREIGN KEY (outside_worker_id) REFERENCES outside_workers (user_id) ON DELETE RESTRICT,
    CONSTRAINT uq_route_stops_1 UNIQUE (route_id, stop_sequence),
    CONSTRAINT uq_route_stops_2 UNIQUE (route_id, outside_worker_id),
    CONSTRAINT uq_route_stops_3 UNIQUE (route_id, stop_id),
    CONSTRAINT ck_route_stops_1 CHECK (stop_sequence IS NULL OR stop_sequence > 0)
);

-- IDENTITY :: delivery_staff
CREATE TABLE delivery_staff (
    user_id UUID PRIMARY KEY,
    licence_no VARCHAR(100),

    CONSTRAINT fk_delivery_staff_1
        FOREIGN KEY (user_id) REFERENCES company_staff (user_id) ON DELETE CASCADE
);

-- ROUTING :: vehicles
-- Each registered vehicle belongs to one driver.
-- A driver can have at most one registered vehicle.
CREATE TABLE vehicles (
    vehicle_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(40) NOT NULL UNIQUE,
    status VARCHAR(40) NOT NULL,
    owner_delivery_staff_id UUID NOT NULL UNIQUE,

    CONSTRAINT fk_vehicles_owner
        FOREIGN KEY (owner_delivery_staff_id) REFERENCES delivery_staff (user_id) ON DELETE RESTRICT,
    CONSTRAINT ck_vehicles_status CHECK (status IN ('available', 'unavailable'))
);

-- FINANCE :: driver_agreements
CREATE TABLE driver_agreements (
    agreement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_staff_id UUID NOT NULL,
    daily_payment NUMERIC(12,2) NOT NULL,
    petrol_rate_per_km NUMERIC(12,2) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    status VARCHAR(40) NOT NULL,

    CONSTRAINT fk_driver_agreements_1
        FOREIGN KEY (delivery_staff_id) REFERENCES delivery_staff (user_id) ON DELETE RESTRICT,
    CONSTRAINT ck_driver_agreements_1 CHECK (daily_payment >= 0),
    CONSTRAINT ck_driver_agreements_2 CHECK (petrol_rate_per_km >= 0),
    CONSTRAINT ck_driver_agreements_3 CHECK (effective_to IS NULL OR effective_to >= effective_from),
    CONSTRAINT ck_driver_agreements_status
        CHECK (status IN ('draft', 'scheduled', 'active', 'ended', 'cancelled'))
);

-- MANUFACTURING :: worker_qualifications
-- A row means the worker is qualified for this net type.
-- Weekly capacity is specific to this worker and net type.
CREATE TABLE worker_qualifications (
    qualification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outside_worker_id UUID NOT NULL,
    net_type_id UUID NOT NULL,
    weekly_capacity INTEGER NOT NULL,

    CONSTRAINT fk_worker_qualifications_1
        FOREIGN KEY (outside_worker_id) REFERENCES outside_workers (user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_worker_qualifications_2
        FOREIGN KEY (net_type_id) REFERENCES net_types (net_type_id) ON DELETE RESTRICT,
    CONSTRAINT uq_worker_qualifications_1 UNIQUE (outside_worker_id, net_type_id),
    CONSTRAINT ck_worker_qualifications_capacity CHECK (weekly_capacity >= 0)
);

-- MANUFACTURING :: stocks
-- One stock is one outside worker's group of nets, not a bulk shipment.
CREATE TABLE stocks (
    stock_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outside_worker_id UUID NOT NULL,
    week_start_date DATE NOT NULL,
    planned_quantity INTEGER NOT NULL,
    status VARCHAR(40) NOT NULL,

    CONSTRAINT fk_stocks_1
        FOREIGN KEY (outside_worker_id) REFERENCES outside_workers (user_id) ON DELETE RESTRICT,
    CONSTRAINT ck_stocks_1 CHECK (planned_quantity > 0),
    CONSTRAINT ck_stocks_status CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled'))
);

-- FINANCE :: monthly_earnings
CREATE TABLE monthly_earnings (
    earning_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outside_worker_id UUID NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_nets INTEGER NOT NULL,
    gross_amount NUMERIC(12,2) NOT NULL,
    adjustment_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    net_amount NUMERIC(12,2) NOT NULL,
    status VARCHAR(40) NOT NULL,
    calculated_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,

    CONSTRAINT fk_monthly_earnings_1
        FOREIGN KEY (outside_worker_id) REFERENCES outside_workers (user_id) ON DELETE RESTRICT,
    CONSTRAINT ck_monthly_earnings_1 CHECK (period_end >= period_start),
    CONSTRAINT ck_monthly_earnings_2 CHECK (total_nets >= 0),
    CONSTRAINT ck_monthly_earnings_3 CHECK (gross_amount >= 0),
    CONSTRAINT ck_monthly_earnings_4 CHECK (net_amount >= 0),
    CONSTRAINT ck_monthly_earnings_status CHECK (status IN ('draft', 'approved'))
);

-- MANUFACTURING :: availability_requests
CREATE TABLE availability_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outside_worker_id UUID NOT NULL,
    week_start_date DATE NOT NULL,
    request_type VARCHAR(40) NOT NULL,
    requested_qty INTEGER,
    reason TEXT,
    status VARCHAR(40) NOT NULL DEFAULT 'pending',

    CONSTRAINT fk_availability_requests_1
        FOREIGN KEY (outside_worker_id) REFERENCES outside_workers (user_id) ON DELETE RESTRICT,
    CONSTRAINT ck_availability_requests_type_qty CHECK (
        (request_type = 'quantity_change' AND requested_qty IS NOT NULL AND requested_qty > 0)
        OR (request_type = 'unavailable' AND requested_qty IS NULL)
    ),
    CONSTRAINT ck_availability_requests_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- ROUTING :: driver_leave_requests
CREATE TABLE driver_leave_requests (
    leave_request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_staff_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(40) NOT NULL DEFAULT 'pending',

    CONSTRAINT fk_driver_leave_requests_1
        FOREIGN KEY (delivery_staff_id) REFERENCES delivery_staff (user_id) ON DELETE RESTRICT,
    CONSTRAINT ck_driver_leave_requests_dates CHECK (end_date >= start_date),
    CONSTRAINT ck_driver_leave_requests_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- SUPPORT :: equipment_requests
CREATE TABLE equipment_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outside_worker_id UUID NOT NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(40) NOT NULL DEFAULT 'pending',

    CONSTRAINT fk_equipment_requests_1
        FOREIGN KEY (outside_worker_id) REFERENCES outside_workers (user_id) ON DELETE RESTRICT,
    CONSTRAINT ck_equipment_requests_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- ROUTING :: route_assignments
CREATE TABLE route_assignments (
    assign_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL,
    delivery_staff_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    driver_agreement_id UUID,
    schedule_date DATE NOT NULL,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    status VARCHAR(40) NOT NULL DEFAULT 'scheduled',
    planned_dist_km NUMERIC(10,2),
    actual_dist_km NUMERIC(10,2),
    payable_dist_km NUMERIC(10,2),
    dist_confirmed_at TIMESTAMPTZ,
    dist_confirmed_by UUID,

    CONSTRAINT fk_route_assignments_1
        FOREIGN KEY (route_id) REFERENCES routes (route_id) ON DELETE RESTRICT,
    CONSTRAINT fk_route_assignments_2
        FOREIGN KEY (delivery_staff_id) REFERENCES delivery_staff (user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_route_assignments_3
        FOREIGN KEY (vehicle_id) REFERENCES vehicles (vehicle_id) ON DELETE RESTRICT,
    CONSTRAINT fk_route_assignments_4
        FOREIGN KEY (driver_agreement_id) REFERENCES driver_agreements (agreement_id) ON DELETE RESTRICT,
    CONSTRAINT fk_route_assignments_5
        FOREIGN KEY (dist_confirmed_by) REFERENCES system_users (user_id) ON DELETE RESTRICT,
    CONSTRAINT uq_route_assignments_1 UNIQUE (assign_id, route_id),
    CONSTRAINT ck_route_assignments_status
        CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    CONSTRAINT ck_route_assignments_times CHECK (
        finished_at IS NULL OR (started_at IS NOT NULL AND finished_at >= started_at)
    ),
    CONSTRAINT ck_route_assignments_status_times CHECK (
        (status <> 'in_progress' OR started_at IS NOT NULL)
        AND (status <> 'completed' OR (started_at IS NOT NULL AND finished_at IS NOT NULL))
    ),
    CONSTRAINT ck_route_assignments_2 CHECK (planned_dist_km IS NULL OR planned_dist_km >= 0),
    CONSTRAINT ck_route_assignments_3 CHECK (actual_dist_km IS NULL OR actual_dist_km >= 0),
    CONSTRAINT ck_route_assignments_4 CHECK (payable_dist_km IS NULL OR payable_dist_km >= 0),
    CONSTRAINT ck_route_assignments_distance_confirmation CHECK (
        (
            payable_dist_km IS NULL
            AND dist_confirmed_at IS NULL
            AND dist_confirmed_by IS NULL
        )
        OR (
            payable_dist_km IS NOT NULL
            AND dist_confirmed_at IS NOT NULL
            AND dist_confirmed_by IS NOT NULL
        )
    )
);

-- MANUFACTURING :: stock_items
CREATE TABLE stock_items (
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_id UUID NOT NULL,
    net_type_id UUID NOT NULL,
    monthly_earning_id UUID,
    unique_net_no VARCHAR(120) NOT NULL UNIQUE,
    status VARCHAR(40) NOT NULL DEFAULT 'planned',
    progress_percent INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    verified_by UUID,
    applied_unit_price NUMERIC(12,2) NOT NULL,

    CONSTRAINT fk_stock_items_1
        FOREIGN KEY (stock_id) REFERENCES stocks (stock_id) ON DELETE RESTRICT,
    CONSTRAINT fk_stock_items_2
        FOREIGN KEY (net_type_id) REFERENCES net_types (net_type_id) ON DELETE RESTRICT,
    CONSTRAINT fk_stock_items_3
        FOREIGN KEY (monthly_earning_id) REFERENCES monthly_earnings (earning_id) ON DELETE RESTRICT,
    CONSTRAINT fk_stock_items_4
        FOREIGN KEY (verified_by) REFERENCES supervisors (user_id) ON DELETE RESTRICT,
    CONSTRAINT ck_stock_items_1 CHECK (progress_percent BETWEEN 0 AND 100),
    CONSTRAINT ck_stock_items_2 CHECK (applied_unit_price >= 0),
    CONSTRAINT ck_stock_items_workflow CHECK (
        (
            status = 'planned'
            AND progress_percent = 0
            AND completed_at IS NULL
            AND verified_at IS NULL
            AND verified_by IS NULL
        )
        OR (
            status = 'in_progress'
            AND progress_percent < 100
            AND completed_at IS NULL
            AND verified_at IS NULL
            AND verified_by IS NULL
        )
        OR (
            status = 'completed'
            AND progress_percent = 100
            AND completed_at IS NOT NULL
            AND verified_at IS NULL
            AND verified_by IS NULL
        )
        OR (
            status = 'verified'
            AND progress_percent = 100
            AND completed_at IS NOT NULL
            AND verified_at IS NOT NULL
            AND verified_by IS NOT NULL
            AND verified_at >= completed_at
        )
    ),
    CONSTRAINT ck_stock_items_earnings_requires_verification
        CHECK (monthly_earning_id IS NULL OR status = 'verified')
);

-- SUPPORT :: equipment_request_items
CREATE TABLE equipment_request_items (
    request_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_request_id UUID NOT NULL,
    equipment_id UUID NOT NULL,
    qty_requested INTEGER NOT NULL,
    qty_approved INTEGER,
    qty_delivered INTEGER,

    CONSTRAINT fk_equipment_request_items_1
        FOREIGN KEY (equipment_request_id) REFERENCES equipment_requests (request_id) ON DELETE CASCADE,
    CONSTRAINT fk_equipment_request_items_2
        FOREIGN KEY (equipment_id) REFERENCES equipment (equipment_id) ON DELETE RESTRICT,
    CONSTRAINT uq_equipment_request_items_request_equipment UNIQUE (equipment_request_id, equipment_id),
    CONSTRAINT ck_equipment_request_items_requested CHECK (qty_requested > 0),
    CONSTRAINT ck_equipment_request_items_approved
        CHECK (qty_approved IS NULL OR qty_approved BETWEEN 0 AND qty_requested),
    CONSTRAINT ck_equipment_request_items_delivered CHECK (
        qty_delivered IS NULL
        OR (qty_approved IS NOT NULL AND qty_delivered BETWEEN 0 AND qty_approved)
    )
);

-- FINANCE :: payments
CREATE TABLE payments (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monthly_earning_id UUID NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(40) NOT NULL,
    reference_no VARCHAR(120),
    status VARCHAR(40) NOT NULL DEFAULT 'recorded',
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_payments_1
        FOREIGN KEY (monthly_earning_id) REFERENCES monthly_earnings (earning_id) ON DELETE RESTRICT,
    CONSTRAINT ck_payments_amount CHECK (amount > 0),
    CONSTRAINT ck_payments_status CHECK (status IN ('recorded', 'voided'))
);

-- ROUTING :: route_stop_visits
CREATE TABLE route_stop_visits (
    visit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_assignment_id UUID NOT NULL,
    route_id UUID NOT NULL,
    route_stop_id UUID NOT NULL,
    arrived_at TIMESTAMPTZ,
    departed_at TIMESTAMPTZ,
    status VARCHAR(40) NOT NULL DEFAULT 'pending',

    CONSTRAINT fk_route_stop_visits_1
        FOREIGN KEY (route_assignment_id, route_id)
        REFERENCES route_assignments (assign_id, route_id) ON DELETE RESTRICT,
    CONSTRAINT fk_route_stop_visits_2
        FOREIGN KEY (route_id, route_stop_id)
        REFERENCES route_stops (route_id, stop_id) ON DELETE RESTRICT,
    CONSTRAINT uq_route_stop_visits_1 UNIQUE (route_assignment_id, route_stop_id),
    CONSTRAINT ck_route_stop_visits_status_times CHECK (
        (
            status IN ('pending', 'skipped')
            AND arrived_at IS NULL
            AND departed_at IS NULL
        )
        OR (
            status = 'arrived'
            AND arrived_at IS NOT NULL
            AND departed_at IS NULL
        )
        OR (
            status = 'completed'
            AND arrived_at IS NOT NULL
            AND departed_at IS NOT NULL
            AND departed_at >= arrived_at
        )
    )
);

-- ROUTING :: location_updates
CREATE TABLE location_updates (
    location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_assignment_id UUID NOT NULL,
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    accuracy_meters NUMERIC(10,2),
    speed_kmh NUMERIC(10,2),

    CONSTRAINT fk_location_updates_1
        FOREIGN KEY (route_assignment_id) REFERENCES route_assignments (assign_id) ON DELETE CASCADE,
    CONSTRAINT ck_location_updates_1 CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT ck_location_updates_2 CHECK (longitude BETWEEN -180 AND 180),
    CONSTRAINT ck_location_updates_3 CHECK (accuracy_meters IS NULL OR accuracy_meters >= 0),
    CONSTRAINT ck_location_updates_4 CHECK (speed_kmh IS NULL OR speed_kmh >= 0)
);

-- FINANCE :: driver_earnings
CREATE TABLE driver_earnings (
    driver_earning_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_assignment_id UUID NOT NULL UNIQUE,
    daily_payment_applied NUMERIC(12,2) NOT NULL,
    petrol_rate_applied NUMERIC(12,2) NOT NULL,
    distance_km NUMERIC(10,2) NOT NULL,
    daily_amount NUMERIC(12,2) NOT NULL,
    petrol_amount NUMERIC(12,2) NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'draft',
    calculated_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,

    CONSTRAINT fk_driver_earnings_1
        FOREIGN KEY (route_assignment_id) REFERENCES route_assignments (assign_id) ON DELETE RESTRICT,
    CONSTRAINT ck_driver_earnings_1 CHECK (daily_payment_applied >= 0),
    CONSTRAINT ck_driver_earnings_2 CHECK (petrol_rate_applied >= 0),
    CONSTRAINT ck_driver_earnings_3 CHECK (distance_km >= 0),
    CONSTRAINT ck_driver_earnings_4 CHECK (daily_amount >= 0),
    CONSTRAINT ck_driver_earnings_5 CHECK (petrol_amount >= 0),
    CONSTRAINT ck_driver_earnings_6 CHECK (total_amount >= 0),
    CONSTRAINT ck_driver_earnings_petrol_calculation
        CHECK (petrol_amount = ROUND(distance_km * petrol_rate_applied, 2)),
    CONSTRAINT ck_driver_earnings_total_calculation CHECK (total_amount = daily_amount + petrol_amount),
    CONSTRAINT ck_driver_earnings_status_times CHECK (
        (status = 'draft' AND approved_at IS NULL)
        OR (
            status = 'approved'
            AND calculated_at IS NOT NULL
            AND approved_at IS NOT NULL
            AND approved_at >= calculated_at
        )
    )
);

-- MANUFACTURING :: stock_handovers
CREATE TABLE stock_handovers (
    handover_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_id UUID NOT NULL,
    route_assignment_id UUID NOT NULL,
    route_stop_visit_id UUID,
    from_user_id UUID NOT NULL,
    to_user_id UUID NOT NULL,
    type VARCHAR(40) NOT NULL,
    handover_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(40) NOT NULL,

    CONSTRAINT fk_stock_handovers_stock
        FOREIGN KEY (stock_id) REFERENCES stocks (stock_id) ON DELETE RESTRICT,
    CONSTRAINT fk_stock_handovers_assignment
        FOREIGN KEY (route_assignment_id) REFERENCES route_assignments (assign_id) ON DELETE RESTRICT,
    CONSTRAINT fk_stock_handovers_visit
        FOREIGN KEY (route_stop_visit_id) REFERENCES route_stop_visits (visit_id) ON DELETE RESTRICT,
    CONSTRAINT fk_stock_handovers_from_user
        FOREIGN KEY (from_user_id) REFERENCES system_users (user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_stock_handovers_to_user
        FOREIGN KEY (to_user_id) REFERENCES system_users (user_id) ON DELETE RESTRICT,
    CONSTRAINT ck_stock_handovers_distinct_users CHECK (from_user_id <> to_user_id),
    CONSTRAINT ck_stock_handovers_type_visit CHECK (
        (type IN ('company_to_driver', 'driver_to_company') AND route_stop_visit_id IS NULL)
        OR (type IN ('driver_to_worker', 'worker_to_driver') AND route_stop_visit_id IS NOT NULL)
    ),
    CONSTRAINT ck_stock_handovers_status CHECK (status IN ('completed', 'partial', 'failed'))
);

-- MANUFACTURING :: stock_handover_items
CREATE TABLE stock_handover_items (
    handover_id UUID NOT NULL,
    stock_item_id UUID NOT NULL,
    outcome VARCHAR(20) NOT NULL,

    PRIMARY KEY (handover_id, stock_item_id),

    CONSTRAINT fk_stock_handover_items_handover
        FOREIGN KEY (handover_id) REFERENCES stock_handovers (handover_id) ON DELETE RESTRICT,
    CONSTRAINT fk_stock_handover_items_stock_item
        FOREIGN KEY (stock_item_id) REFERENCES stock_items (item_id) ON DELETE RESTRICT,
    CONSTRAINT ck_stock_handover_items_outcome CHECK (outcome IN ('transferred', 'not_transferred'))
);

-- FINANCE :: driver_payments
CREATE TABLE driver_payments (
    driver_payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_earning_id UUID NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(40) NOT NULL,
    reference_no VARCHAR(120),
    status VARCHAR(40) NOT NULL DEFAULT 'recorded',
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_driver_payments_1
        FOREIGN KEY (driver_earning_id) REFERENCES driver_earnings (driver_earning_id) ON DELETE RESTRICT,
    CONSTRAINT ck_driver_payments_amount CHECK (amount > 0),
    CONSTRAINT ck_driver_payments_status CHECK (status IN ('recorded', 'voided'))
);

-- INDEXES :: routing
CREATE INDEX idx_routes_zone ON routes (zone_id);
CREATE INDEX idx_route_stops_worker ON route_stops (outside_worker_id);
CREATE INDEX idx_route_assignments_route ON route_assignments (route_id);
CREATE INDEX idx_route_assignments_driver ON route_assignments (delivery_staff_id);
CREATE INDEX idx_route_assignments_vehicle ON route_assignments (vehicle_id);
CREATE INDEX idx_route_assignments_agreement ON route_assignments (driver_agreement_id);
CREATE INDEX idx_route_assignments_distance_confirmer ON route_assignments (dist_confirmed_by);
CREATE INDEX idx_route_stop_visits_assignment_route ON route_stop_visits (route_assignment_id, route_id);
CREATE INDEX idx_route_stop_visits_route_stop ON route_stop_visits (route_id, route_stop_id);
CREATE INDEX idx_location_updates_assignment_recorded_at
    ON location_updates (route_assignment_id, recorded_at DESC);
CREATE INDEX idx_driver_leave_requests_driver ON driver_leave_requests (delivery_staff_id);

-- INDEXES :: identity
CREATE INDEX idx_outside_workers_zone ON outside_workers (zone_id);
CREATE INDEX idx_supervisor_zone_assignments_manager ON supervisor_zone_assignments (manager_id);
CREATE INDEX idx_supervisor_zone_assignments_supervisor ON supervisor_zone_assignments (supervisor_id);
CREATE INDEX idx_supervisor_zone_assignments_zone ON supervisor_zone_assignments (zone_id);

-- INDEXES :: manufacturing
CREATE INDEX idx_worker_qualifications_net_type ON worker_qualifications (net_type_id);
CREATE INDEX idx_stocks_worker_week ON stocks (outside_worker_id, week_start_date);
CREATE INDEX idx_stock_items_stock ON stock_items (stock_id);
CREATE INDEX idx_stock_items_net_type ON stock_items (net_type_id);
CREATE INDEX idx_stock_items_monthly_earning ON stock_items (monthly_earning_id);
CREATE INDEX idx_stock_items_verifier ON stock_items (verified_by);
CREATE INDEX idx_availability_requests_worker_week ON availability_requests (outside_worker_id, week_start_date);
CREATE INDEX idx_stock_handovers_stock ON stock_handovers (stock_id);
CREATE INDEX idx_stock_handovers_assignment ON stock_handovers (route_assignment_id);
CREATE INDEX idx_stock_handovers_visit ON stock_handovers (route_stop_visit_id);
CREATE INDEX idx_stock_handovers_from_user ON stock_handovers (from_user_id);
CREATE INDEX idx_stock_handovers_to_user ON stock_handovers (to_user_id);
CREATE INDEX idx_stock_handover_items_stock_item ON stock_handover_items (stock_item_id);

-- INDEXES :: support
CREATE INDEX idx_notifications_sender ON notifications (sender_user_id);
CREATE INDEX idx_user_notifications_user ON user_notifications (user_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs (actor_user_id);
CREATE INDEX idx_equipment_requests_worker ON equipment_requests (outside_worker_id);
CREATE INDEX idx_equipment_request_items_equipment ON equipment_request_items (equipment_id);

-- INDEXES :: finance
CREATE INDEX idx_driver_agreements_driver ON driver_agreements (delivery_staff_id);
CREATE INDEX idx_monthly_earnings_worker ON monthly_earnings (outside_worker_id);
CREATE INDEX idx_payments_monthly_earning ON payments (monthly_earning_id);
CREATE INDEX idx_driver_payments_earning ON driver_payments (driver_earning_id);

-- Notification references and audit entity references are intentionally
-- polymorphic and do not have a foreign key to one fixed table.
-- The application must enforce role/subtype consistency, validate approved
-- stop order, and preserve the stop order used by existing journeys.

COMMIT;