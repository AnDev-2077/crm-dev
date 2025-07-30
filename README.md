```sql
create table clientes
(
    id            int auto_increment
        primary key,
    nombre        varchar(100)              not null,
    correo        varchar(100)              null,
    telefono      varchar(20)               null,
    direccion     varchar(100)              null,
    is_active     tinyint(1)  default 1     null,
    documento     varchar(50)               null,
    tipoDocumento varchar(50) default 'DNI' not null
);

create table proveedores
(
    id            int auto_increment
        primary key,
    nombre        varchar(100)              not null,
    correo        varchar(100)              null,
    telefono      varchar(20)               null,
    direccion     varchar(100)              null,
    is_active     tinyint(1)  default 1     null,
    documento     varchar(50)               null,
    tipoDocumento varchar(50) default 'RUC' not null
);

create table compras
(
    id           int auto_increment
        primary key,
    proveedor_id int                                 not null,
    fecha        timestamp default CURRENT_TIMESTAMP null,
    orden_compra varchar(20)                         null,
    constraint orden_compra
        unique (orden_compra),
    constraint compras_ibfk_1
        foreign key (proveedor_id) references proveedores (id)
);

create index proveedor_id
    on compras (proveedor_id);

create table tunidad
(
    id     int auto_increment
        primary key,
    nombre varchar(100) not null
);

create table productos
(
    id            int auto_increment
        primary key,
    nombre        varchar(100)                         not null,
    descripcion   text                                 null,
    precio_compra decimal(10, 2)                       null,
    precio_venta  decimal(10, 2)                       null,
    stock         int                                  null,
    tUnidad       int                                  null,
    fechaIngreso  timestamp  default CURRENT_TIMESTAMP null,
    is_active     tinyint(1) default 1                 null,
    imagen        varchar(255)                         null,
    constraint productos_ibfk_1
        foreign key (tUnidad) references tunidad (id)
);

create table detalle_compra
(
    id              int auto_increment
        primary key,
    compra_id       int            not null,
    producto_id     int            not null,
    cantidad        int            not null,
    precio_unitario decimal(10, 2) not null,
    total           decimal(10, 2) as ((`cantidad` * `precio_unitario`)) stored,
    constraint detalle_compra_ibfk_1
        foreign key (compra_id) references compras (id)
            on delete cascade,
    constraint detalle_compra_ibfk_2
        foreign key (producto_id) references productos (id)
);

create index compra_id
    on detalle_compra (compra_id);

create index producto_id
    on detalle_compra (producto_id);

create index tUnidad
    on productos (tUnidad);

create table proveedor_producto
(
    id           int auto_increment
        primary key,
    proveedor_id int not null,
    producto_id  int not null,
    constraint proveedor_producto_ibfk_1
        foreign key (proveedor_id) references proveedores (id),
    constraint proveedor_producto_ibfk_2
        foreign key (producto_id) references productos (id)
);

create index producto_id
    on proveedor_producto (producto_id);

create index proveedor_id
    on proveedor_producto (proveedor_id);

create table usuario
(
    id         bigint unsigned auto_increment
        primary key,
    nombre     varchar(50)          not null,
    apellidos  varchar(100)         not null,
    correo     varchar(100)         not null,
    contraseña varchar(255)         not null,
    rol        varchar(50)          not null,
    is_active  tinyint(1) default 1 null,
    constraint correo
        unique (correo),
    constraint id
        unique (id)
);

create table ventas
(
    id          int auto_increment
        primary key,
    cliente_id  int                                 not null,
    fecha       timestamp default CURRENT_TIMESTAMP null,
    orden_venta varchar(20)                         null,
    constraint orden_venta
        unique (orden_venta),
    constraint ventas_ibfk_1
        foreign key (cliente_id) references clientes (id)
);

create table detalle_venta
(
    id              int auto_increment
        primary key,
    venta_id        int            not null,
    producto_id     int            not null,
    cantidad        int            not null,
    precio_unitario decimal(10, 2) not null,
    total           decimal(10, 2) as ((`cantidad` * `precio_unitario`)) stored,
    constraint detalle_venta_ibfk_1
        foreign key (venta_id) references ventas (id)
            on delete cascade,
    constraint detalle_venta_ibfk_2
        foreign key (producto_id) references productos (id)
);

create index producto_id
    on detalle_venta (producto_id);

create index venta_id
    on detalle_venta (venta_id);

create index cliente_id
    on ventas (cliente_id);
```
