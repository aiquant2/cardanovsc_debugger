-- module Main where

-- main :: IO ()
-- main = putStrLn "Hello, Haskell!"


-- SimpleCalculator.hs
module SimpleCalculator where

-- Function to add two numbers
add :: Int -> Int -> Int
add x y = x + y

-- Function to subtract two numbers
subtract :: Int -> Int -> Int
subtract x y = x - y

-- Function to multiply two numbers
multiply :: Int -> Int -> Int
multiply x y = x * y

-- Function to divide two numbers
divide :: Int -> Int -> Either String Int
divide _ 0 = Left "Error: Division by zero"
divide x y = Right (x `div` y)

-- Main function to test the operations
main :: IO ()
main = do
    let a = 10
    let b = 5
    putStrLn ("Addition: " ++ show (add a b))
    putStrLn ("Subtraction: " ++ show (subtract a b))
    putStrLn ("Multiplication: " ++ show (multiply a b))
    case divide a b of
        Left errMsg -> putStrLn errMsg
        Right result -> putStrLn ("Division: " ++ show result)
