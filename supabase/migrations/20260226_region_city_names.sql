-- Bölge kayıtlarında kapsanan şehir isimlerini name alanına yaz (NUTS2)
UPDATE cities SET name = 'Orta Anadolu: Kırıkkale, Aksaray, Niğde, Nevşehir, Kırşehir, Kayseri, Sivas, Yozgat' WHERE slug = 'tr7';
UPDATE cities SET name = 'Batı Karadeniz: Zonguldak, Karabük, Bartın, Kastamonu, Çankırı, Sinop' WHERE slug = 'tr8';
UPDATE cities SET name = 'Doğu Karadeniz: Trabzon, Ordu, Giresun, Rize, Artvin, Gümüşhane' WHERE slug = 'tr9';
UPDATE cities SET name = 'Kuzeydoğu Anadolu: Erzurum, Erzincan, Bayburt, Ağrı, Kars, Iğdır, Ardahan' WHERE slug = 'tra';
UPDATE cities SET name = 'Ortadoğu Anadolu: Malatya, Elazığ, Bingöl, Tunceli, Van, Muş, Bitlis, Hakkari' WHERE slug = 'trb';
UPDATE cities SET name = 'Güneydoğu Anadolu: Gaziantep, Adıyaman, Kilis, Şanlıurfa, Diyarbakır, Mardin, Batman, Şırnak, Siirt' WHERE slug = 'gaziantep';
