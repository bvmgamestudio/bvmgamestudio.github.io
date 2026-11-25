# BvM Game Studio web sitesi

Yayın adresi: https://bvmgamestudio.github.io/

Bu depo GitHub Pages ile yayınlanır. `main` dalına gönderilen (push) her değişiklik birkaç dakika içinde sitede görünür. Herhangi bir derleme adımı yok, dosyalar olduğu gibi yayınlanır.

## Neyi nerede bulurum?

| Dosya / klasör | Ne işe yarar |
|---|---|
| `js/content.js` | **Düzenleyeceğin dosya bu.** Sitedeki bütün metinler (EN + TR), oyun bilgileri, linkler ve e-posta burada. |
| `index.html` | Ana sayfanın iskeleti. |
| `privacy/*.html` | Oyunların gizlilik sayfaları (EN + TR). |
| `css/site.css` | Renkler ve görünüm. |
| `assets/` | Görseller, mağaza rozetleri, yazı tipleri. |
| `app-ads.txt` | AdMob doğrulaması. **Silme, değiştirme.** |
| `vinedril/`, `vinedril-privacy/` | Mağazalarda kayıtlı eski destek ve gizlilik adresleri. **Silme.** |

## Metin değiştirmek

`js/content.js` dosyasını aç. `"en"` bölümünde İngilizce, `"tr"` bölümünde Türkçe metinler var. Tırnak işaretlerinin arasındaki metni değiştir.

Dikkat edilecekler:
- Metnin içinde çift tırnak (`"`) kullanacaksan başına ters bölü koy: `\"`
- Satır sonlarındaki virgülleri silme.

## Vinedril yayına çıkınca

`js/content.js` içinde `"id": "vinedril"` olan bölümü bul:

1. **Ön kayıt açıldığında:** `"preregister": null` değerini `"preregister": "https://play.google.com/store/apps/details?id=..."` yap. Buton tıklanabilir hale gelir.
2. **Çıkış tarihi belli olunca:** `"releaseDate": null` değerini `"releaseDate": "2026-12-15T10:00:00+03:00"` gibi yaz. Kartta geri sayım belirir. Tarih geçince geri sayım kendiliğinden kaybolur.
3. **Oyun çıktığında:** `"status": "soon"` değerini `"status": "live"` yap ve `"appStore"` ile `"googlePlay"` alanlarına mağaza linklerini yaz. Kartta "Yayında" etiketi ve mağaza rozetleri görünür.
4. **Bir mağazada henüz yoksa:** O mağazanın linkine `"soon"` yaz (örnek: `"googlePlay": "soon"`). Kartta rozet yerine "Google Play: çok yakında" etiketi görünür. Link belli olunca `"soon"` yerine linki yaz.

## Yeni oyun eklemek

1. Oyunun ikonunu 512×512 boyutunda `.webp` olarak kaydet ve `assets/img/` klasörüne koy (örnek: `assets/img/yeni-oyun-512.webp`).
2. `js/content.js` içindeki `"games"` listesine yeni bir bölüm ekle. En kolayı mevcut oyunlardan birini kopyalayıp değiştirmek. `"id"`, `"name"`, `"icon"`, `"description"`, linkler ve `"privacy"` alanını güncelle.
3. **Gizlilik sayfası:** `privacy/vinedril.html` dosyasını kopyalayıp `privacy/<id>.html` adıyla kaydet. İçindeki `<article data-lang="en">` ve `<article data-lang="tr">` bloklarının içeriğini yeni oyunun politikasıyla değiştir. `"privacy"` alanına `"privacy/<id>.html"` yazdığında, alt bilgideki gizlilik linki bütün sayfalarda kendiliğinden görünür.
4. `"theme"` değeri kartın rengini belirler: Shrink & Score için `"sns"` (yeşil/turuncu), Vinedril için `"vin"` (kahve/turkuaz). Yeni oyuna kendi renklerini vermek için `css/site.css` içinde `.card--vin` kısmını kopyalayıp yeni bir tema yaz.

## Telefonda en üstteki oyun

Telefonda kartlar alt alta dizilir. `"featured": true` yazan oyun, yayında olsun ya da olmasın, her zaman en üstte görünür. Şu an bu oyun Vinedril. Başka bir oyunu öne çıkarmak için `"featured": true` satırını o oyunun bölümüne taşı. Masaüstünde kartlar yan yana durduğu için bu ayar oradaki sırayı değiştirmez.

## Sosyal medya linkleri

Instagram, TikTok ve YouTube linkleri `js/content.js` içindeki `"socials"` listesinde duruyor. Simgeler İletişim bölümünde ve her sayfanın alt bilgisinde görünür.

- Link değiştirmek için `"url"` değerini düzenle.
- Bir hesabı kaldırmak için o satırı sil. Liste boşalırsa simgeler hiç görünmez.
- Yeni bir platform eklersen (örneğin `{ "id": "x", "label": "X", "url": "https://..." }`), simgesi tanımlı değilse yuvarlak bir butonda adı yazar.

## Bilgisayarında önizleme

Bu klasörde bir terminal aç ve şu komutu çalıştır:

```
python -m http.server 8000
```

Sonra tarayıcıda http://localhost:8000 adresini aç.

## Yayınlamak

**1. Sürüm etiketlerini güncelle.** `css/` ya da `js/` içindeki bir dosyayı (örneğin `content.js`) değiştirdiysen, `site` klasöründe şunu çalıştır:

```
python ../tools/stamp_versions.py .
```

Bu komut sayfalardaki `?v=...` etiketlerini yeniler. Böylece ziyaretçilerin tarayıcısı eski dosyalarla yeni sayfayı karıştırmaz.

**2. Önce mutlaka önizle.** `js/content.js` dosyasında eksik bir virgül ya da tırnak, oyun kartlarının yerine sade bir yedek liste çıkmasına yol açar. Önizlemede kartları görüyorsan yayınlayabilirsin.

**3. Gönder:**

```
git add .
git commit -m "Metinleri güncelle"
git push
```

## Notlar

- Yayınladıktan sonra telefonda eski hali görürsen birkaç dakika bekle ya da sayfayı yenile. GitHub Pages dosyaları tarayıcıda 10 dakikaya kadar önbellekte tutturuyor.
- Sitede analitik ve çerez yok. Tarayıcıda sadece ziyaretçinin dil tercihi (`bvm-lang`) saklanıyor.
- Yazı tipleri (Baloo 2 ve Nunito, SIL Open Font License) sitenin kendi dosyalarından yükleniyor, Google'a istek gitmiyor.
- App Store ve Google Play rozetleri Apple'a ve Google'a aittir. Kullanım kurallarına göre rozetlerin şekli ve rengi değiştirilmemeli.
