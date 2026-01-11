"use client";

import { useEffect, useState } from "react";
import { getTeams } from "@/actions/team";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useParams } from "next/navigation";

interface TeamSelectFieldProps {
    control: any;
    disabled?: boolean;
}

export const TeamSelectField = ({ control, disabled }: TeamSelectFieldProps) => {
    const params = useParams();
    const workspaceId = params.workspaceId as string;
    const [teams, setTeams] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (workspaceId) {
            getTeams(workspaceId).then((data) => {
                setTeams(data);
                setIsLoading(false);
            });
        }
    }, [workspaceId]);

    return (
        <FormField
            control={control}
            name="teamId"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Team (Optional)</FormLabel>
                    <Select
                        disabled={disabled || isLoading}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                    >
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={isLoading ? "Loading teams..." : "Select a team"} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {teams.map((team) => (
                                <SelectItem key={team.id} value={team.id}>
                                    {team.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
