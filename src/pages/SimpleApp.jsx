import React, { useState, useEffect } from 'react';

function SimpleApp() {
  // Dados mockados
  const [products, setProducts] = useState([
    { id: 1, name: 'Camiseta Básica', price: 49.90, stockQuantity: 10 },
    { id: 2, name: 'Calça Jeans', price: 129.90, stockQuantity: 5 },
    { id: 3, name: 'Tênis Esportivo', price: 199.90, stockQuantity: 3 }
  ]);

  const [variations, setVariations] = useState([
    { id: 1, productId: 1, name: 'Tamanho', value: 'P', stockQuantity: 3 },
    { id: 2, productId: 1, name: 'Tamanho', value: 'M', stockQuantity: 4 },
    { id: 3, productId: 1, name: 'Tamanho', value: 'G', stockQuantity: 3 },
    { id: 4, productId: 2, name: 'Tamanho', value: '38', stockQuantity: 2 },
    { id: 5, productId: 2, name: 'Tamanho', value: '40', stockQuantity: 3 },
    { id: 6, productId: 3, name: 'Tamanho', value: '41', stockQuantity: 1 },
    { id: 7, productId: 3, name: 'Tamanho', value: '42', stockQuantity: 2 }
  ]);

  // Estado do carrinho
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [total, setTotal] = useState(0);

  // Estados de interface
  const [activeTab, setActiveTab] = useState('products');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);

  // Formulário de produto
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [variationName, setVariationName] = useState('');
  const [variationValue, setVariationValue] = useState('');
  const [variationStock, setVariationStock] = useState('');
  const [productVariations, setProductVariations] = useState([]);

  // Estado para formulário de estoque
  const [newStockValue, setNewStockValue] = useState('');

  // Endereço para checkout
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  // Calcular valores do carrinho
  useEffect(() => {
    const newSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Regras de frete
    let newShipping = 20; // Valor padrão
    if (newSubtotal >= 200) {
      newShipping = 0; // Frete grátis
    } else if (newSubtotal >= 52 && newSubtotal <= 166.59) {
      newShipping = 15;
    }
    
    setSubtotal(newSubtotal);
    setShipping(newShipping);
    setTotal(newSubtotal + newShipping);
  }, [cartItems]);

  // Funções do sistema
  const showAlert = (message, type = 'success') => {
    setAlertMessage({ message, type });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  // Manipulação de produtos
  const handleNewProduct = () => {
    setSelectedProduct(null);
    setProductName('');
    setProductPrice('');
    setProductStock('');
    setProductVariations([]);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setProductName(product.name);
    setProductPrice(product.price.toString());
    setProductStock(product.stockQuantity.toString());
    
    // Buscar variações do produto
    const prodVars = variations.filter(v => v.productId === product.id);
    setProductVariations(prodVars);
    
    setShowProductModal(true);
  };

  const handleSaveProduct = () => {
    if (!productName || !productPrice) {
      showAlert('Preencha todos os campos obrigatórios', 'danger');
      return;
    }

    const productData = {
      id: selectedProduct ? selectedProduct.id : Date.now(),
      name: productName,
      price: parseFloat(productPrice),
      stockQuantity: parseInt(productStock) || 0
    };

    if (selectedProduct) {
      // Atualizar produto existente
      setProducts(products.map(p => p.id === selectedProduct.id ? productData : p));
      showAlert('Produto atualizado com sucesso!');
    } else {
      // Adicionar novo produto
      setProducts([...products, productData]);
      showAlert('Produto criado com sucesso!');
    }

    // Fechar modal
    setShowProductModal(false);
  };

  // Manipulação de variações
  const handleAddVariation = () => {
    if (!variationName || !variationValue || !variationStock) {
      showAlert('Preencha todos os campos da variação', 'danger');
      return;
    }

    const newVariation = {
      id: Date.now(),
      productId: selectedProduct ? selectedProduct.id : null,
      name: variationName,
      value: variationValue,
      stockQuantity: parseInt(variationStock)
    };
    
    setProductVariations([...productVariations, newVariation]);
    setVariationName('');
    setVariationValue('');
    setVariationStock('');
  };

  const handleRemoveVariation = (index) => {
    const updatedVariations = [...productVariations];
    updatedVariations.splice(index, 1);
    setProductVariations(updatedVariations);
  };

  // Manipulação de estoque
  const handleUpdateInventory = (variation) => {
    setSelectedVariation(variation);
    setNewStockValue(variation.stockQuantity.toString());
    setShowInventoryModal(true);
  };

  const handleSaveInventory = () => {
    if (!newStockValue || parseInt(newStockValue) < 0) {
      showAlert('Digite um valor válido para o estoque', 'danger');
      return;
    }

    setVariations(
      variations.map(v => 
        v.id === selectedVariation.id 
          ? { ...v, stockQuantity: parseInt(newStockValue) } 
          : v
      )
    );
    
    showAlert('Estoque atualizado com sucesso!');
    setShowInventoryModal(false);
  };

  // Manipulação do carrinho
  const handleAddToCart = (product) => {
    // Verificar se o produto tem variações
    const productVars = variations.filter(v => v.productId === product.id);
    
    if (productVars.length > 0) {
      // Pegar a primeira variação com estoque
      const variation = productVars.find(v => v.stockQuantity > 0);
      
      if (variation) {
        const cartItem = {
          id: Date.now(),
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          variationId: variation.id,
          variation: `${variation.name} - ${variation.value}`
        };
        
        setCartItems([...cartItems, cartItem]);
        showAlert('Produto adicionado ao carrinho!');
      } else {
        showAlert('Produto sem estoque disponível', 'danger');
      }
    } else {
      // Adicionar produto sem variação
      if (product.stockQuantity > 0) {
        const cartItem = {
          id: Date.now(),
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        };
        
        setCartItems([...cartItems, cartItem]);
        showAlert('Produto adicionado ao carrinho!');
      } else {
        showAlert('Produto sem estoque disponível', 'danger');
      }
    }
  };

  const handleRemoveCartItem = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
    showAlert('Item removido do carrinho');
  };

  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity < 1) return;
    
    setCartItems(cartItems.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const handleSearchCep = async () => {
    if (cep.length !== 8) {
      showAlert('CEP inválido. Digite os 8 dígitos.', 'danger');
      return;
    }
  
    try {
      showAlert('Buscando CEP...', 'info');
      
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
  
      if (data.erro) {
        showAlert('CEP não encontrado', 'danger');
        return;
      }
  
      setAddress({
        street: data.logradouro || '',
        number: '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || ''
      });
  
      showAlert('CEP encontrado! Endereço preenchido automaticamente.');
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      showAlert('Erro ao buscar CEP. Tente novamente.', 'danger');
    }
  };

  // Finalização de compra
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showAlert('Seu carrinho está vazio', 'danger');
      return;
    }
    
    if (!address.street || !address.number || !address.city || !address.state) {
      showAlert('Complete o endereço de entrega', 'danger');
      return;
    }
    
    showAlert('Pedido realizado com sucesso!');
    setCartItems([]);
    setCep('');
    setAddress({
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: ''
    });
  };

  return (
    <div className="d-flex flex-column" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Alerta */}
      {alertMessage && (
        <div className={`alert alert-${alertMessage.type} alert-dismissible fade show m-0 rounded-0`} role="alert" style={{ zIndex: 1000 }}>
          {alertMessage.message}
          <button type="button" className="btn-close" onClick={() => setAlertMessage(null)}></button>
        </div>
      )}
      
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold" href="#">Montink</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <a className="nav-link active" href="#">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Produtos</a>
              </li>
            </ul>
            <div className="d-flex">
              <button className="btn btn-outline-primary position-relative">
                <i className="bi bi-cart"></i> Carrinho
                {cartItems.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartItems.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Conteúdo principal */}
      <div className="container-fluid flex-grow-1" style={{ overflow: 'hidden' }}>
        <div className="row h-100 g-0">
          {/* Painel de Produtos/Estoque */}
          <div className="col-lg-8 h-100 p-2" style={{ overflowY: 'auto' }}>
            <div className="card h-100 shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center bg-light">
                <h5 className="mb-0">Gerenciamento de Produtos</h5>
                <button className="btn btn-primary" onClick={handleNewProduct}>
                  <i className="bi bi-plus-circle me-1"></i> Novo Produto
                </button>
              </div>
              
              <div className="card-body" style={{ overflowY: 'auto' }}>
                <ul className="nav nav-tabs mb-3">
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
                      onClick={() => setActiveTab('products')}
                    >
                      Produtos
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${activeTab === 'inventory' ? 'active' : ''}`}
                      onClick={() => setActiveTab('inventory')}
                    >
                      Estoque
                    </button>
                  </li>
                </ul>

                {/* Aba de Produtos */}
                {activeTab === 'products' && (
                  <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Preço</th>
                          <th>Estoque</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center">Nenhum produto encontrado</td>
                          </tr>
                        ) : (
                          products.map(product => (
                            <tr key={product.id}>
                              <td>{product.name}</td>
                              <td>R$ {product.price.toFixed(2).replace('.', ',')}</td>
                              <td>{product.stockQuantity}</td>
                              <td>
                                <div className="btn-group">
                                  <button 
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => handleEditProduct(product)}
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => handleAddToCart(product)}
                                    disabled={product.stockQuantity <= 0}
                                  >
                                    <i className="bi bi-cart-plus"></i> Comprar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Aba de Estoque */}
                {activeTab === 'inventory' && (
                  <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Produto</th>
                          <th>Variação</th>
                          <th>Quantidade</th>
                          <th>Status</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variations.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center">Nenhum item de estoque encontrado</td>
                          </tr>
                        ) : (
                          variations.map(variation => {
                            const product = products.find(p => p.id === variation.productId);
                            return (
                              <tr key={variation.id}>
                                <td>{product ? product.name : ''}</td>
                                <td>{variation.name} - {variation.value}</td>
                                <td>{variation.stockQuantity}</td>
                                <td>
                                  {variation.stockQuantity <= 0 ? (
                                    <span className="badge bg-danger">Indisponível</span>
                                  ) : variation.stockQuantity < 5 ? (
                                    <span className="badge bg-warning text-dark">Baixo estoque</span>
                                  ) : (
                                    <span className="badge bg-success">Em estoque</span>
                                  )}
                                </td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleUpdateInventory(variation)}
                                  >
                                    Atualizar
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Carrinho de Compras */}
          <div className="col-lg-4 h-100 p-2" style={{ overflowY: 'auto' }}>
            <div className="card h-100 shadow-sm d-flex flex-column">
              <div className="card-header bg-light">
                <h5 className="mb-0">Carrinho de Compras</h5>
              </div>
              
              <div className="card-body flex-grow-1" style={{ overflowY: 'auto' }}>
                {cartItems.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-cart3 fs-1 text-muted"></i>
                    <p className="mt-2 text-muted">Seu carrinho está vazio</p>
                  </div>
                ) : (
                  <>
                    <div className="cart-items mb-3">
                      {cartItems.map(item => (
                        <div key={item.id} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                          <div>
                            <div className="fw-bold">{item.name}</div>
                            <div className="small text-muted">
                              {item.variation && <span>{item.variation}</span>}
                              <div className="d-flex align-items-center mt-1">
                                <button 
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <i className="bi bi-dash"></i>
                                </button>
                                <span className="mx-2">{item.quantity}</span>
                                <button 
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                >
                                  <i className="bi bi-plus"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="text-end">
                            <div>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</div>
                            <button 
                              className="btn btn-sm text-danger mt-1"
                              onClick={() => handleRemoveCartItem(item.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="cart-summary mb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Subtotal:</span>
                        <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Frete:</span>
                        <span>
                          {shipping === 0 
                            ? <span className="text-success">Grátis</span> 
                            : `R$ ${shipping.toFixed(2).replace('.', ',')}`}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between fw-bold">
                        <span>Total:</span>
                        <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                    
                    <div className="shipping-address">
                      <h6 className="mb-3">Endereço de Entrega</h6>
                      
                      <div className="mb-3">
                        <div className="input-group">
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="CEP (somente números)" 
                            value={cep}
                            onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                          />
                          <button 
                            className="btn btn-outline-secondary" 
                            type="button"
                            onClick={handleSearchCep}
                          >
                            Buscar
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Rua" 
                          value={address.street}
                          onChange={(e) => setAddress({...address, street: e.target.value})}
                        />
                      </div>
                      
                      <div className="row mb-2">
                        <div className="col-5">
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Número" 
                            value={address.number}
                            onChange={(e) => setAddress({...address, number: e.target.value})}
                          />
                        </div>
                        <div className="col-7">
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Bairro" 
                            value={address.neighborhood}
                            onChange={(e) => setAddress({...address, neighborhood: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="row mb-2">
                        <div className="col-8">
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Cidade" 
                            value={address.city}
                            onChange={(e) => setAddress({...address, city: e.target.value})}
                          />
                        </div>
                        <div className="col-4">
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="UF" 
                            value={address.state}
                            onChange={(e) => setAddress({...address, state: e.target.value})}
                            maxLength={2}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="card-footer bg-light">
                <button 
                  className="btn btn-success w-100" 
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                >
                  Finalizar Compra
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Produto */}
      {showProductModal && (
        <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedProduct ? 'Editar Produto' : 'Novo Produto'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowProductModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="productName" className="form-label">Nome do Produto *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="productPrice" className="form-label">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    id="productPrice"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="productStock" className="form-label">Estoque Total</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    id="productStock"
                    value={productStock}
                    onChange={(e) => setProductStock(e.target.value)}
                  />
                  <div className="form-text">Deixe em branco para somar automaticamente das variações</div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Variações</label>
                  
                  {productVariations.length > 0 && (
                    <div className="table-responsive mb-3">
                      <table className="table table-sm table-bordered">
                        <thead>
                          <tr>
                            <th>Nome</th>
                            <th>Valor</th>
                            <th>Estoque</th>
                            <th style={{width: "60px"}}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {productVariations.map((variation, index) => (
                            <tr key={index}>
                              <td>{variation.name}</td>
                              <td>{variation.value}</td>
                              <td>{variation.stockQuantity}</td>
                              <td className="text-center">
                                <button 
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleRemoveVariation(index)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  <div className="row g-2 align-items-end">
                    <div className="col">
                      <label className="form-label small">Nome</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ex: Cor, Tamanho"
                        value={variationName}
                        onChange={(e) => setVariationName(e.target.value)}
                      />
                    </div>
                    <div className="col">
                      <label className="form-label small">Valor</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ex: Azul, G"
                        value={variationValue}
                        onChange={(e) => setVariationValue(e.target.value)}
                      />
                    </div>
                    <div className="col-2">
                      <label className="form-label small">Estoque</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={variationStock}
                        onChange={(e) => setVariationStock(e.target.value)}
                      />
                    </div>
                    <div className="col-auto">
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={handleAddVariation}
                      >
                        <i className="bi bi-plus"></i> Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowProductModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleSaveProduct}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Atualização de Estoque */}
      {showInventoryModal && selectedVariation && (
        <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Atualizar Estoque</h5>
                <button type="button" className="btn-close" onClick={() => setShowInventoryModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Produto</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={products.find(p => p.id === selectedVariation.productId)?.name || ''}
                    readOnly 
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Variação</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={`${selectedVariation.name} - ${selectedVariation.value}`}
                    readOnly 
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="newStockValue" className="form-label">Quantidade em Estoque</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    id="newStockValue"
                    value={newStockValue}
                    onChange={(e) => setNewStockValue(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowInventoryModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleSaveInventory}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SimpleApp;