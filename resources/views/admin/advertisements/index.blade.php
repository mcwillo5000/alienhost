@extends('layouts.admin')

@section('title')
    Advertisements
@endsection

@section('content-header')
    <h1>Advertisements<small>Manage server advertisements</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Advertisements</li>
    </ol>
@endsection

@section('content')
    <div class="row">
        <div class="col-lg-3 col-xs-6">
            <div class="small-box bg-aqua">
                <div class="inner">
                    <h3>{{ $totalAdsSent }}</h3>
                    <p>Total Ads Sent</p>
                </div>
                <div class="icon">
                    <i class="fa fa-paper-plane"></i>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-xs-6">
            <div class="small-box bg-green">
                <div class="inner">
                    <h3>{{ $todayAdsSent }}</h3>
                    <p>Today's Ads Sent</p>
                </div>
                <div class="icon">
                    <i class="fa fa-calendar"></i>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-xs-6">
            <div class="small-box bg-yellow">
                <div class="inner">
                    <h3>{{ $activeAdvertisements }}</h3>
                    <p>Active Advertisements</p>
                </div>
                <div class="icon">
                    <i class="fa fa-bullhorn"></i>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-xs-6">
            <div class="small-box bg-blue">
                <div class="inner">
                    <h3>{{ $serversToSendAdsTo }}</h3>
                    <p>Servers to Send Ads To</p>
                </div>
                <div class="icon">
                    <i class="fa fa-server"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-xs-12">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title">Advertisement List</h3>
                    <div class="box-tools">
                        <a href="{{ route('admin.advertisements.create') }}" class="btn btn-primary btn-sm">
                            <i class="fa fa-plus"></i> Create Advertisement
                        </a>
                    </div>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Target</th>
                                <th>Command</th>
                                <th>Interval (Minutes)</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($advertisements as $advertisement)
                                <tr>
                                    <td>{{ $advertisement->id }}</td>
                                    <td>{{ $advertisement->name }}</td>
                                    <td>
                                        <span class="label label-info">Nest: {{ $advertisement->nest->name ?? 'N/A' }}</span>
                                    </td>
                                    <td>
                                        @if(is_array($advertisement->commands))
                                            @foreach($advertisement->commands as $cmd)
                                                <code>{{ Str::limit($cmd, 50) }}</code>@if(!$loop->last)<br>@endif
                                            @endforeach
                                        @else
                                            <code>{{ Str::limit($advertisement->commands ?? '', 50) }}</code>
                                        @endif
                                    </td>
                                    <td>{{ $advertisement->interval_minutes }}</td>
                                    <td>
                                        @if($advertisement->is_active)
                                            <span class="label label-success">Active</span>
                                        @else
                                            <span class="label label-default">Inactive</span>
                                        @endif
                                    </td>
                                    <td>
                                        <a href="{{ route('admin.advertisements.edit', $advertisement->id) }}" class="btn btn-xs btn-info">
                                            <i class="fa fa-pencil"></i> Edit
                                        </a>
                                        <form action="{{ route('admin.advertisements.send', $advertisement->id) }}" method="POST" style="display: inline-block;">
                                            @csrf
                                            <button type="submit" class="btn btn-xs btn-success" onclick="return confirm('Send this advertisement to all servers in the nest now?')">
                                                <i class="fa fa-paper-plane"></i> Send Ad
                                            </button>
                                        </form>
                                        <form action="{{ route('admin.advertisements.destroy', $advertisement->id) }}" method="POST" style="display: inline-block;">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-xs btn-danger" onclick="return confirm('Are you sure you want to delete this advertisement?')">
                                                <i class="fa fa-trash"></i> Delete
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="7" class="text-center">No advertisements found. <a href="{{ route('admin.advertisements.create') }}">Create one</a> to get started.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
@endsection

