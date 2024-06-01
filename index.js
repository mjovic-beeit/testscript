(function() {
  const productID = new URLSearchParams(window.location.search).get('productID') || 'default-product-id';

  const container = document.getElementById('product-recommendations-container');

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    .product-card {
      text-align: center;
      padding: 10px;
    }
    .product-card img {
      width: 100px;
      height: 100px;
      object-fit: cover;
      display: block;
      margin: 0 auto;
    }
    .product-card .product-name {
      margin-top: 10px;
    }
    .product-card .checkbox-container {
      margin-top: 10px;
    }
    .slick-slide {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }
  `;
  document.head.appendChild(style);

  // Inject HTML
  container.innerHTML = `
    <div class="slider">
      <!-- This is where the product cards will be injected dynamically -->
    </div>
    <button onclick="handleOrder()">Order</button>
  `;

  // Function to dynamically fetch and inject product cards
  fetch(`https://affiliate-console-lwhnjaysma-oa.a.run.app/api/v1/products/recommended-products?productID=${productID}`)
    .then(response => response.json())
    .then(data => {
      const validProducts = data.data.filter(product => product.productQuantity > 0);
      const slider = container.querySelector('.slider');
      validProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
          <img src="${product.productImage}" alt="${product.productName}" />
          <div class="product-name">${product.productName}</div>
          <div class="checkbox-container">
            <input type="checkbox" id="checkbox-${product.productID}" />
            <label for="checkbox-${product.productID}"> Buy this item</label>
          </div>
        `;
        slider.appendChild(productCard);
      });
      // Initialize slick carousel after adding product cards
      $('.slider').slick({
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1
      });
    })
    .catch(error => {
      console.error('Error fetching recommended products:', error);
    });

  window.handleOrder = function() {
    const selectedProducts = Array.from(document.querySelectorAll('.product-card input[type="checkbox"]:checked')).map(checkbox => ({
      productID: checkbox.id.replace('checkbox-', ''),
      productQuantity: 1
    }));

    if (selectedProducts.length > 0) {
      const form = document.createElement('form');
      form.action = 'https://zzqg-001.dx.commercecloud.salesforce.com/on/demandware.store/Sites-RefArch-Site/en_US/Affiliate-AddRecommendedProducts';
      form.method = 'POST';

      selectedProducts.forEach(product => {
        const productDataInput = document.createElement('input');
        productDataInput.type = 'hidden';
        productDataInput.name = 'recommendedProductsData';
        productDataInput.value = JSON.stringify(product);
        form.appendChild(productDataInput);
      });

      const recommenderHashInput = document.createElement('input');
      recommenderHashInput.type = 'hidden';
      recommenderHashInput.name = 'recommenderHash';
      recommenderHashInput.value = 'test';
      form.appendChild(recommenderHashInput);

      document.body.appendChild(form);
      form.submit();
    }
  };
})();
