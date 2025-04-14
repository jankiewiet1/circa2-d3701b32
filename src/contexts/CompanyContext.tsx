
  // Create a new company
  const createCompany = async (name: string, industry: string): Promise<{ error: any, company: Company | null }> => {
    try {
      if (!user) {
        return { error: new Error('User not authenticated'), company: null };
      }
      
      // Insert new company
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          name,
          industry,
          created_by_user_id: user.id,
        })
        .select()
        .single();
      
      if (companyError) {
        toast({
          title: "Company Creation Failed",
          description: companyError.message,
          variant: "destructive"
        });
        return { error: companyError, company: null };
      }
      
      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('company_members')
        .insert({
          company_id: newCompany.id,
          user_id: user.id,
          role: 'admin',
        });
      
      if (memberError) {
        toast({
          title: "Error Adding Admin",
          description: memberError.message,
          variant: "destructive"
        });
        return { error: memberError, company: null };
      }
      
      // Update local state
      await fetchCompanyData();
      
      toast({
        title: "Company Created",
        description: `${name} has been successfully created`,
      });
      
      // Add missing fields to match our Company type
      const companyWithAllFields: Company = {
        id: newCompany.id,
        name: newCompany.name,
        industry: newCompany.industry,
        created_by_user_id: newCompany.created_by_user_id,
        created_at: newCompany.created_at,
        updated_at: undefined
      };
      
      return { error: null, company: companyWithAllFields };
    } catch (error: any) {
      toast({
        title: "Company Creation Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      
      return { error, company: null };
    }
  };
