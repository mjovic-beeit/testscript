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
    <div id="root"></div>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react/17.0.2/umd/react.production.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/17.0.2/umd/react-dom.production.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.js"></script>
    <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
    <script type="text/babel">
      const { useState, useEffect } = React;

      const ProductSlider = ({ productID }) => {
        const [recommendedProducts, setRecommendedProducts] = useState([]);

        useEffect(() => {
          fetch(\`https://affiliate-console-lwhnjaysma-oa.a.run.app/api/v1/products/recommended-products?productID=${productID}\`, {
            method: 'GET',
          })
          .then(response => response.json())
          .then(data => {
            const validProducts = data.data.filter(product => product.productQuantity > 0);
            setRecommendedProducts(validProducts);

            setTimeout(() => {
              $('.slider').slick({
                dots: true,
                infinite: true,
                speed: 500,
                slidesToShow: 3,
                slidesToScroll: 1
              });
            }, 100);
          })
          .catch(error => {
            console.error('Error fetching recommended products:', error);
          });
        }, [productID]);

        const handleOrder = () => {
          const selectedProducts = recommendedProducts.filter(product => {
            return document.getElementById('checkbox-' + product.productID).checked;
          }).map(product => ({
            productID: product.productID,
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

        return (
          <div>
            <div className="slider">
              {recommendedProducts.map((product, index) => (
                <div key={index} className="product-card">
                  <img src={product.productImage} alt={product.productName} />
                  <div className="product-name">{product.productName}</div>
                  <div className="checkbox-container">
                    <input type="checkbox" id={'checkbox-' + product.productID} />
                    <label htmlFor={'checkbox-' + product.productID}> Buy this item</label>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleOrder}>Order</button>
          </div>
        );
      };

      const App = () => {
        return <ProductSlider productID={productID} />;
      };

      ReactDOM.render(<App />, document.getElementById('root'));
    </script>
  `;
})();
