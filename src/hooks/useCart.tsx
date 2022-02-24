import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const storagedCart = localStorage.getItem('@RocketShoes:cart');
      
      const { data } = await api.get('/stock/' + productId);
      const maxAmount = data.amount;
      
      if (storagedCart) {
        const cart = JSON.parse(storagedCart);
        let isUpdated = false;
        
        const updatedCart = cart.map((product: Product) => {
          if (product.id === productId && product.amount + 1 <= maxAmount) {
            isUpdated = true;
            return { ...product, amount: product.amount + 1 };
          } else if (product.id === productId){
            isUpdated = true;
            toast.error('Quantidade solicitada fora de estoque');
            return product;
          } else {
            return product;
          }
        });

        if (!isUpdated) {
          const { data } = await api.get('/products/' + productId);
          const newUpdatedCart = [ ...updatedCart, { ...data, amount: 1 } ];
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(newUpdatedCart));
          setCart(newUpdatedCart);
        } else {
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
          setCart(updatedCart);
        }
      } else { // nesse caso o localStorage ainda nao possui dados
        const { data } = await api.get('/products/' + productId);
        const productData = [{ ...data, amount: 1 }];

        localStorage.setItem('@RocketShoes:cart', JSON.stringify(productData));
        setCart(productData);
      }
    } catch {
      toast.error('Erro na adicao do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const storagedCart = localStorage.getItem('@RocketShoes:cart') as string;
      const cart: Product[] = JSON.parse(storagedCart);

      const updatedCart = cart.filter(product => product.id !== productId);

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedCart));
      setCart(updatedCart);
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
