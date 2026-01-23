# 1. Install dependencies                                     
  pnpm install                                                  
                                                                
  # 2. Create .env.local with required variables                
  cat > .env.local << 'EOF'                                     
  # Supabase                                                    
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co     
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key                   
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key               
                                                                
  # Stripe                                                      
  STRIPE_SECRET_KEY=sk_test_...                                 
  STRIPE_WEBHOOK_SECRET=whsec_...                               
                                                                
  # Email (Resend)                                              
  RESEND_API_KEY=re_...                                         
  ADMIN_EMAIL=orders@lellisdesigns.com                          
  FROM_EMAIL=L. Ellis Designs <orders@lellisdesigns.com>        
                                                                
  # Optional                                                    
  PICKUP_ADDRESS=123 Main St, Baton Rouge, LA                   
  NEXT_PUBLIC_SITE_URL=https://lellisdesigns.com                
  EOF                                                           
                                                                
  # Start PostgreSQL (if not already running)                                                                                         
  docker start lellis-postgres                                                                                                        
                                                                                                                                      
  # Start dev server                                                                                                                  
  pnpm dev                                                                                                                            
                                                                                                                                      
  # Access at http://localhost:3000                                                                                                   
                                                                                                                                      
  Stopping:                                                                                                                           
  # Stop dev server: Ctrl+C in terminal                                                                                               
  # Stop PostgreSQL (optional - can leave running)                                                                                    
  docker stop lellis-postgres                            
  
                       
  # 4. In a separate terminal - Stripe webhook forwarding       
  (required for checkout)                                       
  stripe login                                                  
  stripe listen --forward-to localhost:3000/api/webhooks/stripe 
                                                                
  # Copy the webhook secret from Stripe CLI output to           
  STRIPE_WEBHOOK_SECRET                                         
                                                                
  # 5. Test checkout with these card numbers:                   
  # Success: 4242 4242 4242 4242                                
  # Decline: 4000 0000 0000 0002                                
  # Any future expiry (12/34), any CVC (123)        



   # Set up DATABASE_URL in .env.local first                                                                 
  DATABASE_URL=postgresql://username:password@localhost:5432/lellis_designs                                 
                                                                                                            
  # Then run:                                                                                               
  pnpm run seed              # Create test data                                                             
  pnpm run seed:dry-run      # Preview what would be deleted                                                
  pnpm run seed:clean        # Delete test data (with confirmation)                                         
  pnpm run seed:clean:force  # Delete test data (no confirmation)             
                                             