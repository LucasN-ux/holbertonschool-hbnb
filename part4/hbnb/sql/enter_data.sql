-- Initial data for HBnB

INSERT INTO users (
    id,
    first_name,
    last_name,
    email,
    password,
    is_admin
) VALUES (
    '36c9050e-ddd3-4c3b-9731-9f487208bbc1',
    'Admin',
    'HBnB',
    'admin@hbnb.io',
    '$2y$12$K633Two0aGd2vWWmRBbeMum7/2G540jZPaVoROC48GyqJkmg8qrxe',
    TRUE
);

INSERT INTO amenities (id, name) VALUES
('0655b617-2cc4-430e-802f-79362a458210', 'WiFi'),
('9ffa99ba-4af0-4650-af3b-0496ffe3e7aa', 'Swimming Pool'),
('e470c3db-8950-498e-8a13-de8a2d0bc910', 'Air Conditioning');
